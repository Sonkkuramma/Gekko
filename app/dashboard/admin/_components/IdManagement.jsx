import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TopicIdManager from './IdManagers/TopicIdManager';
import ModuleIdManager from './IdManagers/ModuleIdManager';
import SectionIdManager from './IdManagers/SectionIdManager';
import ExamIdManager from './IdManagers/ExamIdManager';
import TagIdManager from './IdManagers/TagIdManager';

const IdManagement = () => {
  const [activeTab, setActiveTab] = useState('topic');

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="topic">Topic ID</TabsTrigger>
          <TabsTrigger value="module">Module ID</TabsTrigger>
          <TabsTrigger value="section">Section ID</TabsTrigger>
          <TabsTrigger value="exam">Exam ID</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        <TabsContent value="topic">
          <TopicIdManager />
        </TabsContent>
        <TabsContent value="module">
          <ModuleIdManager />
        </TabsContent>
        <TabsContent value="section">
          <SectionIdManager />
        </TabsContent>
        <TabsContent value="exam">
          <ExamIdManager />
        </TabsContent>
        <TabsContent value="tags">
          <TagIdManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IdManagement;
