'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book, Clock, Layers } from 'lucide-react';

const TestCard = ({ test }) => {
  const router = useRouter();
  const difficultyColor = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800',
  }[test.difficulty];

  const handleStartTest = () => {
    const testSlug = test.slug || test.name.toLowerCase().replace(/ /g, '-');
    router.push(`/test/${encodeURIComponent(testSlug)}`);
  };

  return (
    <Card className="h-full rounded-sm">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium line-clamp-2 flex-1">
            {test.name}
          </h3>
          <Badge className={`${difficultyColor} ml-2`}>{test.difficulty}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div className="flex items-center">
            <Book className="text-gray-500 mr-1" size={12} />
            <span>{test.num_questions} questions</span>
          </div>
          <div className="flex items-center">
            <Clock className="text-gray-500 mr-1" size={12} />
            <span>15 minutes</span>
          </div>
          {test.module_test_ids && (
            <div className="flex items-center">
              <Layers className="text-gray-500 mr-1" size={12} />
              <span>{test.module_test_ids.length} modules</span>
            </div>
          )}
        </div>
        <Button
          className="w-full text-xs rounded-sm"
          size="sm"
          onClick={handleStartTest}
        >
          Start Test
        </Button>
      </CardContent>
    </Card>
  );
};

const TopicTestsLayout = ({ data }) => {
  return (
    <div className="space-y-8">
      {data.modules.map((module) => (
        <div key={module.module_id} className="space-y-2">
          <h3 className="text-xl font-semibold">{module.name}</h3>
          {module.topics.map((topic) => (
            <div key={topic.topic_id} className="space-y-4">
              <h4 className="text-lg font-medium">{topic.name}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {topic.tests.map((test) => (
                  <TestCard key={test.topic_test_id} test={test} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const ModuleTestsLayout = ({ data }) => {
  return (
    <div className="space-y-8">
      {data.sections.map((section) => (
        <div key={section.section_id} className="space-y-2">
          <h3 className="text-xl font-semibold">{section.name}</h3>
          {section.modules.map((module) => (
            <div key={module.module_id} className="space-y-4">
              <h4 className="text-lg font-medium">{module.name}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {module.tests.map((test) => (
                  <TestCard key={test.module_test_id} test={test} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const SectionTestsLayout = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((test) => (
          <TestCard key={test.id} test={test} />
        ))}
      </div>
    </div>
  );
};

const TestPackPage = ({ testPack }) => {
  const renderTestLayout = () => {
    switch (testPack.pack_type) {
      case 'topic tests':
        return <TopicTestsLayout data={testPack.data} />;
      case 'module tests':
        return <ModuleTestsLayout data={testPack.data} />;
      case 'section tests':
        return <SectionTestsLayout data={testPack.data} />;
      default:
        return <div>Unsupported test pack type</div>;
    }
  };

  return (
    <Card className="w-[calc(100%-3px)] my-3 mx-2 rounded-sm">
      <CardHeader className="border-b">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{testPack.name}</h1>
          {testPack.shortDescription && (
            <p className="text-gray-600">{testPack.shortDescription}</p>
          )}
          <div className="flex gap-2">
            {testPack.is_premium && (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                Premium
              </Badge>
            )}
            {testPack.tags?.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-[calc(100vh-300px)]">
          {renderTestLayout()}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TestPackPage;
