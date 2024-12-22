import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  exam_id: z.string().min(1, 'Exam is required'),
  pack_type: z.enum([
    'topic tests',
    'module tests',
    'section tests',
    'fulllength tests',
  ]),
  pack_name: z.string().min(1, 'Pack name is required'),
  pack_slug: z.string().min(1, 'Pack slug is required'),
  pack_short_description: z.string(),
  pack_long_description: z.string(),
  is_premium: z.boolean(),
  pack_image_url: z.string(),
  pack_banner_url: z.string(),
});

export function CreatePack() {
  const [exams, setExams] = useState([]);
  const [createdPack, setCreatedPack] = useState(null);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exam_id: '',
      pack_type: '',
      pack_name: '',
      pack_slug: '',
      pack_short_description: '',
      pack_long_description: '',
      is_premium: false,
      pack_image_url: '',
      pack_banner_url: '',
    },
  });

  useEffect(() => {
    const fetchExams = async () => {
      try {
        console.log('Fetching exams...');
        const response = await fetch('/api/testpacks?action=getExams');
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch exams: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        console.log('Fetched exams:', data);
        setExams(data);
      } catch (error) {
        console.error('Error fetching exams:', error);
        setError(error.message);
      }
    };

    fetchExams();
  }, []);

  // Function to generate slug from pack name
  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  // Function to update pack_slug, pack_image_url, and pack_banner_url when pack_name changes
  const updateDependentFields = (name) => {
    const slug = generateSlug(name);
    form.setValue('pack_slug', slug);
    form.setValue('pack_image_url', `/images/testpackimgs/${slug}.png`);
    form.setValue('pack_banner_url', `/images/testpackbanners/${slug}.png`);
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'pack_name') {
        updateDependentFields(value.pack_name);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values) {
    try {
      const response = await fetch('/api/testpacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create test pack');
      }

      const result = await response.json();
      console.log('Test pack created:', result);
      setCreatedPack(result.data);
      form.reset();
    } catch (error) {
      console.error('Error creating test pack:', error);
      setError(error.message);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full max-w-4xl mx-auto"
      >
        <div className="flex flex-wrap -mx-2">
          <div className="w-1/2 px-2 mb-4">
            <FormField
              control={form.control}
              name="exam_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Name</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-2 border-black">
                        <SelectValue placeholder="Select an exam" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {exams.length > 0 ? (
                        exams.map((exam) => (
                          <SelectItem key={exam.exam_id} value={exam.exam_id}>
                            {exam.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-exams" disabled>
                          {error ? 'Error loading exams' : 'No exams available'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-1/2 px-2 mb-4">
            <FormField
              control={form.control}
              name="pack_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pack Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-2 border-black">
                        <SelectValue placeholder="Select a pack type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="topic tests">Topic Tests</SelectItem>
                      <SelectItem value="module tests">Module Tests</SelectItem>
                      <SelectItem value="section tests">
                        Section Tests
                      </SelectItem>
                      <SelectItem value="fulllength tests">
                        Full Length Tests
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-1/2 px-2 mb-4">
            <FormField
              control={form.control}
              name="pack_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pack Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-2 border-black" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-1/2 px-2 mb-4">
            <FormField
              control={form.control}
              name="pack_slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pack Slug</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-2 border-black"
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-1/2 px-2 mb-4">
            <FormField
              control={form.control}
              name="pack_short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="border-2 border-black" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-1/2 px-2 mb-4">
            <FormField
              control={form.control}
              name="pack_long_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Long Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="border-2 border-black" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-1/2 px-2 mb-4">
            <FormField
              control={form.control}
              name="is_premium"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-black px-2 h-full">
                  <div className="">
                    <FormLabel className="text-base">Premium</FormLabel>
                    <FormDescription>
                      {/* Is this a premium test pack? */}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="w-1/2 px-2 mb-4">
            <FormField
              control={form.control}
              name="pack_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pack Image URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-2 border-black"
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-1/2 px-2 mb-4">
            <FormField
              control={form.control}
              name="pack_banner_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pack Banner URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-2 border-black"
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="w-full px-2">
          <Button type="submit" className="w-full">
            Create Test Pack
          </Button>
        </div>

        {createdPack && (
          <div className="w-full px-2 mt-4">
            <p className="text-center">
              Created Pack ID: {createdPack.pack_id}
            </p>
          </div>
        )}

        {error && (
          <div className="w-full px-2 mt-4">
            <p className="text-center text-red-500">Error: {error}</p>
          </div>
        )}
      </form>
    </Form>
  );
}

export default CreatePack;
