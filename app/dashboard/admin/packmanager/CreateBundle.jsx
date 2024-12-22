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
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  exam_id: z.string().length(4, 'Exam ID must be 4 characters'),
  pack_types: z.array(z.string()).min(1, 'At least one pack type is required'),
  bundle_name: z
    .string()
    .min(1, 'Bundle name is required')
    .max(255, 'Bundle name must be 255 characters or less'),
  bundle_slug: z
    .string()
    .min(1, 'Bundle slug is required')
    .max(255, 'Bundle slug must be 255 characters or less'),
  bundle_short_description: z.string(),
  bundle_long_description: z.string(),
  is_premium: z.boolean(),
  bundle_image_url: z
    .string()
    .max(255, 'Image URL must be 255 characters or less'),
  bundle_banner_url: z
    .string()
    .max(255, 'Banner URL must be 255 characters or less'),
});

const packTypes = [
  { id: 'topic tests', label: 'Topic Tests' },
  { id: 'module tests', label: 'Module Tests' },
  { id: 'section tests', label: 'Section Tests' },
  { id: 'fulllength tests', label: 'Full Length Tests' },
];

export function CreateBundle() {
  const [exams, setExams] = useState([]);
  const [createdBundle, setCreatedBundle] = useState(null);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exam_id: '',
      pack_types: [],
      bundle_name: '',
      bundle_slug: '',
      bundle_short_description: '',
      bundle_long_description: '',
      is_premium: false,
      bundle_image_url: '',
      bundle_banner_url: '',
    },
  });

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch('/api/testpacks?action=getExams');
        if (!response.ok) {
          throw new Error(
            `Failed to fetch exams: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        setExams(data);
      } catch (error) {
        console.error('Error fetching exams:', error);
        setError(error.message);
      }
    };

    fetchExams();
  }, []);

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  const updateDependentFields = (name) => {
    const slug = generateSlug(name);
    form.setValue('bundle_slug', slug);
    form.setValue('bundle_image_url', `/images/bundleimgs/${slug}.png`);
    form.setValue('bundle_banner_url', `/images/bundlebanners/${slug}.png`);
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'bundle_name') {
        updateDependentFields(value.bundle_name);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values) {
    try {
      const response = await fetch('/api/bundles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create bundle');
      }

      const result = await response.json();
      console.log('Bundle created:', result);
      setCreatedBundle(result.data);
      form.reset();
    } catch (error) {
      console.error('Error creating bundle:', error);
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
              name="pack_types"
              render={() => (
                <FormItem>
                  <FormLabel>Pack Types</FormLabel>
                  <div className="border-2 border-black rounded-md p-2">
                    {packTypes.map((type) => (
                      <FormField
                        key={type.id}
                        control={form.control}
                        name="pack_types"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={type.id}
                              className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          type.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== type.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {type.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-1/2 px-2 mb-4">
            <FormField
              control={form.control}
              name="bundle_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bundle Name</FormLabel>
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
              name="bundle_slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bundle Slug</FormLabel>
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
              name="bundle_short_description"
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
              name="bundle_long_description"
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
                    <FormDescription>Is this a premium bundle?</FormDescription>
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
              name="bundle_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bundle Image URL</FormLabel>
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
              name="bundle_banner_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bundle Banner URL</FormLabel>
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
            Create Bundle
          </Button>
        </div>

        {createdBundle && (
          <div className="w-full px-2 mt-4">
            <p className="text-center">
              Created Bundle ID: {createdBundle.bundle_id}
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

export default CreateBundle;
