/* =====================================
All JavaScript fuctions Start
======================================*/

(function ($) {
	
    'use strict';
	
	mobile_nav();
	mobile_side_drawer()

	//________Nav submenu show hide on mobile by = custom.js________//	
	 function mobile_nav(){
		jQuery(".sub-menu, .mega-menu").parent('li').addClass('has-child');
		jQuery("<div class='fa fa-angle-right submenu-toogle'></div>").insertAfter(".has-child > a");

		// Click handler for arrow
		jQuery('.has-child a+.submenu-toogle').on('click',function(ev) {

			jQuery(this).parent().siblings(".has-child ").children(".sub-menu, .mega-menu").slideUp(500, function(){
				jQuery(this).parent().removeClass('nav-active');
			});

			jQuery(this).next(jQuery('.sub-menu, .mega-menu ')).slideToggle(500, function(){
				jQuery(this).parent().toggleClass('nav-active');
			});

			ev.stopPropagation();
		});

		// Click handler for link itself (mobile view only)
		jQuery('.has-child > a').on('click', function(ev) {
			// Only work in mobile view
			if (window.innerWidth > 768) {
				return;
			}
			
			// If link has href="#" or no href, prevent default and toggle submenu
			var href = jQuery(this).attr('href');
			if (!href || href === '#' || href === '') {
				ev.preventDefault();
				ev.stopPropagation();
				
				var $parent = jQuery(this).parent();
				var $submenu = $parent.find('.sub-menu, .mega-menu').first();
				
				// Close other submenus
				$parent.siblings(".has-child").each(function(){
					jQuery(this).find(".sub-menu, .mega-menu").slideUp(500, function(){
						jQuery(this).parent().removeClass('nav-active');
					});
				});
				
				// Toggle current submenu
				$submenu.slideToggle(500, function(){
					$parent.toggleClass('nav-active');
				});
			}
		});

	}
	
//________Mobile side drawer function by = custom.js________//
	function mobile_side_drawer(){
		jQuery('#mobile-side-drawer').on('click', function () { 
			jQuery('.mobile-sider-drawer-menu').toggleClass('active');
		});
	}

})(jQuery);
