import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreatePack from '../packmanager/CreatePack';
import ManagePack from '../packmanager/ManagePack';
import CreateBundle from '../packmanager/CreateBundle';
import ManageBundle from '../packmanager/ManageBundles';
import TagManager from '../packmanager/TagManager';

const PackManager = () => {
  const [activeTab, setActiveTab] = useState('createPack');

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="createPack">Create Pack</TabsTrigger>
          <TabsTrigger value="managePack">Manage Pack</TabsTrigger>
          <TabsTrigger value="createBundle">Create Bundle</TabsTrigger>
          <TabsTrigger value="manageBundles">Manage Bundles</TabsTrigger>
          <TabsTrigger value="tagManager">Tag Manager</TabsTrigger>
        </TabsList>
        <TabsContent value="createPack">
          <CreatePack />
        </TabsContent>
        <TabsContent value="managePack">
          <ManagePack />
        </TabsContent>
        <TabsContent value="createBundle">
          <CreateBundle />
        </TabsContent>
        <TabsContent value="manageBundles">
          <ManageBundle />
        </TabsContent>
        <TabsContent value="tagManager">
          <TagManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PackManager;
