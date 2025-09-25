'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useSendOpinion } from '../hooks/useOpinion';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message cannot be empty'),
});

type FormValues = z.infer<typeof formSchema>;

export const FormOpinion = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const { mutateAsync: sendOpinion } = useSendOpinion();

  const onSubmit = async (values: FormValues) => {
    try {
      await sendOpinion(values);
      toast.success('Message sent successfully!');
      reset();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send message');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1 text-foreground">
          Email
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
          placeholder="user@email.com"
        />
        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-1 text-foreground">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          {...register('subject')}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
          placeholder="Feedback, Suggestion, etc."
        />
        {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1 text-foreground">
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          {...register('message')}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary transition"
          placeholder="Write your thoughts here..."
        />
        {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 bg-secondary hover:bg-secondary/90 font-semibold px-5 py-2 rounded-lg transition-all"
      >
        {isSubmitting ? 'Sending...' : 'Send'}
      </Button>
    </form>
  );
};
