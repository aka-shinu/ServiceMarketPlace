import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import MDEditor from '@uiw/react-md-editor';

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
}

interface PolicyPageProps {
  initialSlug?: string;
}

export default function PolicyPage({ initialSlug }: PolicyPageProps) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  // Use initialSlug if provided, otherwise use the URL parameter
  const slug = initialSlug || paramSlug;

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setPage(data);
      } catch (error) {
        console.error('Error fetching page:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Page not found</h1>
        <p className="mt-4 text-gray-600">
          The requested policy page could not be found. Please contact support if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
      <div className="prose max-w-none bg-white p-8 rounded-lg shadow">
        <MDEditor.Markdown source={page.content} />
      </div>
    </div>
  );
} 