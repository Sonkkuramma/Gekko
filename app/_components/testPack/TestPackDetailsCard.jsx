// 'use client';

// import React from 'react';
// import Image from 'next/image';
// import ClientButton from '../ClientButton';
// import { BookOpen, Clock, BarChart, Star } from 'lucide-react';

// const CourseDetailsCard = ({ course }) => {
//   const handleEnroll = () => {
//     console.log('Enroll clicked for course:', course.title);
//     // Here you would typically handle the enrollment process
//     // This might involve calling an API, updating user state, etc.
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden">
//       <div className="relative">
//         <Image
//           src={course.bannerImage}
//           alt={course.title}
//           width={1200}
//           height={400}
//           className="w-full h-64 object-cover"
//         />
//         {course.isPremium && (
//           <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
//             Premium
//           </span>
//         )}
//       </div>
//       <div className="p-1">
//         <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
//         <p className="text-gray-600 mb-4">{course.subtitle}</p>
//         <div className="flex flex-wrap gap-2 mb-4">
//           {course.tags.map((tag, index) => (
//             <span
//               key={index}
//               className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
//             >
//               {tag}
//             </span>
//           ))}
//         </div>
//         <div className="grid grid-cols-2 gap-4 mb-6">
//           <div className="flex items-center gap-2">
//             <BookOpen className="h-5 w-5 text-blue-500" />
//             <span>{course.modules.length} Modules</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Clock className="h-5 w-5 text-blue-500" />
//             <span>Estimated 20 hours</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <BarChart className="h-5 w-5 text-blue-500" />
//             <span>{course.coursePackType}</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Star className="h-5 w-5 text-yellow-400" />
//             <span>4.8 (120 reviews)</span>
//           </div>
//         </div>
//         <div className="bg-gray-100 p-4 rounded-lg mb-6">
//           <h2 className="font-semibold mb-2">Course Content Preview</h2>
//           <ul className="list-disc list-inside">
//             {course.modules.slice(0, 3).map((module, index) => (
//               <li key={index}>{module.moduleName}</li>
//             ))}
//           </ul>
//         </div>
//         <ClientButton
//           option="Enroll Now"
//           onClick={handleEnroll}
//           className="w-full"
//         />
//       </div>
//     </div>
//   );
// };

// export default CourseDetailsCard;
