'use client';

import { useRouter } from 'next/navigation';
import data from '../public/data/data.json';
import Banner from './_components/Banner';
import CourseCard from './_components/testPack/TestPackCard';

export default function Home() {
  const router = useRouter();

  const handleCardClick = (slug) => {
    console.log(`Navigating to: /${slug}/details`);
    router.push(`/${slug}/details`);
  };

  return (
    <div className="p-2">
      <section className="bg-gray-900 text-white rounded-sm mb-5">
        <div className="mx-auto max-w-screen-xl px-4 py-16 lg:flex lg:items-center">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
              Understand User Flow.
              <span className="sm:block"> Increase Conversion. </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl sm:text-xl/relaxed">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nesciunt
              illo tenetur fuga ducimus numquam ea!
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                className="block w-full rounded border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-white focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
                href="#"
              >
                Get Started
              </a>
              <a
                className="block w-full rounded border border-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring active:bg-blue-500 sm:w-auto"
                href="#"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      <Banner />
      {/* <div className="flex flex-col md:flex-row">
        <div className="flex-1 grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((coursePack) => (
            <CourseCard
              key={coursePack.id}
              coursePack={coursePack}
              onClick={handleCardClick}
            />
          ))}
        </div>
      </div> */}
    </div>
  );
}
