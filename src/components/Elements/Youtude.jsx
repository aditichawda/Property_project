import React from "react";
  const videos = [
    { videoId: "dQw4w9WgXcQ", title: "Daloda Mandi Bhav Update - 24 Sept 2025" },
    { videoId: "9bZkp7q19f0", title: "Farmer Interview: Insights on Crop Growth" },
    { videoId: "3JZ_D3ELwOQ", title: "Mandsaur District Mandi Prices Today" },
    { videoId: "l482T0yNkeo", title: "Daily Crop Information & Market Analysis" },
  ];
  class VideoGallery extends React.Component {
      render() {
          return (
    // <div>
    //   {/* Page Header */}
    //   <div className="w-full flex justify-center about_main_bg">
    //     <div className="w-full lg:w-4/5 px-4 py-3">
    //       <h1 className="text-4xl font-bold text-[#349764]">Video Gallery</h1>
    //       <p className="pt-3 text-lg">
    //         Welcome to our video gallery, here you can see daily agriculture
    //         crops information, interviews, mandi bhav updates and the latest
    //         mandi bhav videos are shown every day. We provide Daloda Mandi Bhav
    //         in the Mandsaur district through attractive video content.
    //       </p>
    //     </div>
    //   </div>

    //   {/* Video List */}
    //   <div className="w-full flex justify-center">
    //     <div className="w-full lg:w-4/5 px-4 py-3">
    //       <div className="flex flex-wrap justify-center lg:justify-between py-4">
    //         {videos &&
    //           videos.map((video, index) =>
    //             video.videoId ? (
    //               <div key={index} className="w-full md:w-1/2 lg:w-1/3 p-4">
    //                 <div className="w-full photo_card rounded-tr-lg shadow">
    //                   <div className="flex rounded-tr-lg min-h-[50px] bg-gray-100 px-2 py-2">
    //                     <i className="fab fa-youtube fa-2x text-red-600 mr-3"></i>
    //                     <h6 className="Youtubeheading_truncate font-semibold text-sm">
    //                       {video.title}
    //                     </h6>
    //                   </div>
    //                   <div className="relative w-full h-[200px]">
    //                     <iframe
    //                       className="w-full h-full object-contain"
    //                       src={`https://www.youtube.com/embed/${video.videoId}`}
    //                       title={video.title}
    //                       frameBorder="0"
    //                       allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
    //                       allowFullScreen
    //                     ></iframe>
    //                   </div>
    //                 </div>
    //               </div>
    //             ) : null
    //           )}
    //       </div>
    //     </div>
    //   </div>
    // </div>
     <>
      {/* Header */}
      <div className="w-full flex justify-center about_main_bg">
        <div className="w-full lg:w-4/5 px-4 py-3">
          <h1 className="text-4xl font-bold text-[#349764]">Video Gallery</h1>
          <p className="pt-3 text-lg">
            Welcome to our video gallery, here you can see daily agriculture
            crops information, interviews, mandi bhav updates and the latest
            mandi bhav videos are shown every day. We provide Daloda Mandi Bhav
            in the Mandsaur district through attractive video content.
          </p>
        </div>
      </div>

      {/* Video List */}
      <div className="w-full flex justify-center">
        <div className="w-full lg:w-4/5 px-4 py-3">
          <div className="flex flex-wrap justify-center lg:justify-between py-4">
            {videos.map(
              (video, index) =>
                video.videoId && (
                  <div
                    key={index}
                    className="w-full md:w-1/2 lg:w-1/3 p-4"
                  >
                    <div className="w-full photo_card rounded-tr-lg shadow">
                      {/* Card Header */}
                      <div className="flex rounded-tr-lg min-h-[50px] bg-gray-100 px-2 py-2">
                        <i className="fab fa-youtube fa-2x text-red-600 mr-3"></i>
                        <h6 className="Youtubeheading_truncate font-semibold text-sm">
                          {video.title}
                        </h6>
                      </div>
                      {/* Video Iframe */}
                      <div className="relative w-full h-[200px]">
                        <iframe
                          className="w-full h-full object-contain"
                          src={`https://www.youtube.com/embed/${video.videoId}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={video.title}
                        />
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </>
  );
};
  }
export default VideoGallery;
