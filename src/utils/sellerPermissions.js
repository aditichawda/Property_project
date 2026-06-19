export function normalizePermissionName(value) {
  return String(value || '').trim().toLowerCase();
}

function pickPermissionName(permission) {
  if (!permission) return '';
  if (typeof permission === 'string') return permission;

  const direct =
    permission.permission_name ||
    permission.permissionName ||
    permission.name ||
    permission.title ||
    permission.section_name ||
    permission.sectionName ||
    permission.key ||
    permission.slug ||
    permission.code ||
    permission.value ||
    '';
  if (direct) return direct;

  const nested =
    permission.permission ||
    permission.privilege ||
    permission.module_permission ||
    permission.modulePermission ||
    null;
  if (nested) return pickPermissionName(nested);

  const moduleName =
    permission.module ||
    permission.module_name ||
    permission.moduleName ||
    permission.group ||
    '';
  const actionName =
    permission.action ||
    permission.action_name ||
    permission.actionName ||
    permission.label ||
    '';
  return moduleName && actionName ? `${moduleName}.${actionName}` : '';
}

function collectPermissionNames(source, names = []) {
  if (!source) return names;
  if (Array.isArray(source)) {
    source.forEach((item) => collectPermissionNames(item, names));
    return names;
  }

  const name = pickPermissionName(source);
  if (name) names.push(name);

  if (typeof source !== 'object') return names;

  [
    source.permissions,
    source.permission_list,
    source.permissionList,
    source.role_permissions,
    source.privileges,
    source.children,
    source.items,
  ]
    .filter(Boolean)
    .forEach((nested) => collectPermissionNames(nested, names));

  const childPermissions = [
    source.permissions,
    source.permission_list,
    source.permissionList,
  ].find(Array.isArray);
  if (name && childPermissions) {
    childPermissions.forEach((child) => {
      const childName = pickPermissionName(child);
      if (childName && !childName.includes('.')) {
        names.push(`${name}.${childName}`);
      }
    });
  }

  return names;
}

export function extractPermissionNames(permissions) {
  return collectPermissionNames(permissions).filter(Boolean);
}

export function hasPermissionPayload(source) {
  if (!source || typeof source !== 'object') return false;
  return [
    'permissions',
    'staffPermissions',
    'staff_permissions',
    'role_permissions',
    'privileges',
  ].some((key) => Object.prototype.hasOwnProperty.call(source, key));
}

const PERMISSION_GROUPS = {
  'dashboard.manage': ['dashboard.manage', 'dashboard.view'],
  'enquiry.manage': [
    'enquiry.manage',
    'enquiry.view',
    'enquiry.converted',
    'enquiry.convert',
    'enquiry.addfollowup',
    'enquiry.followup',
    'enquiry.assignstaff',
    'enquiry.assign',
  ],
  'solarcrm.manage': [
    'solarcrm.manage',
    'solarcrm.view',
    'solarcrm.edit',
    'solarcrm.lead.add',
    'solarcrm.add',
    'solarcrm.followup',
    'solarcrm.assignstaff',
    'solarcrm.assign',
  ],
  'staff.manage': [
    'staff.manage',
    'staff.view',
    'staff.create',
    'staff.edit',
    'staff.active',
    'staff.delete',
  ],
  'services.manage': [
    'services.manage',
    'services.view',
    'services.add',
    'services.edit',
    'services.delete',
  ],
  'dashboard.settings': [
    'dashboard.settings',
    'account.detail',
    'account.edit',
    'profile.view',
    'profile.edit',
    'change.password',
  ],
  'role.permission': ['role.permission', 'role.view', 'role.manage'],
  'privilege.permission': [
    'privilege.permission',
    'permission.manage',
    'permission.view',
  ],
};

function permissionMatches(permissionSet, requiredPermission) {
  if (permissionSet.has(requiredPermission)) return true;
  const aliases = PERMISSION_GROUPS[requiredPermission] || [];
  if (aliases.some((alias) => permissionSet.has(alias))) return true;

  const [moduleName] = requiredPermission.split('.');
  if (!moduleName) return false;
  return Array.from(permissionSet).some((permission) => {
    if (!permission.startsWith(`${moduleName}.`)) return false;
    return permission.endsWith('.manage') || permission.endsWith('.view');
  });
}

function getSellerAccountType(seller) {
  if (seller?.isStaff || seller?.staffId || seller?.staff_id) {
    return 'staff';
  }
  const rawTypes = [
    seller?.accountType,
    seller?.user_type,
    seller?.userType,
    seller?.apiUserType,
    seller?.type,
    seller?.apiType,
    seller?.loginType,
    seller?.role,
  ]
    .flat()
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean);
  if (rawTypes.some((type) => ['staff', 'employee'].includes(type))) {
    return 'staff';
  }
  if (
    rawTypes.some((type) =>
      ['seller', 'solar_seller', 'solarseller', 'partner'].includes(type),
    )
  ) {
    return 'seller';
  }
  return rawTypes[0] || '';
}

export function hasSellerPermission(seller, requiredPermissions) {
  const required = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];
  const cleanRequired = required.filter(Boolean).map(normalizePermissionName);
  if (!cleanRequired.length) return true;

  const permissionSource =
    seller?.staffPermissions ??
    seller?.permissions ??
    seller?.staff_permissions ??
    null;
  if (getSellerAccountType(seller) === 'seller') {
    return true;
  }

  const permissionSet = new Set(
    extractPermissionNames(permissionSource).map(normalizePermissionName),
  );
  return cleanRequired.some((permission) =>
    permissionMatches(permissionSet, permission),
  );
}

export function hasAnySellerPermission(seller, requiredPermissions) {
  return hasSellerPermission(seller, requiredPermissions);
}
