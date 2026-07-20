import { useEffect } from 'react';
import axios from '@/api/axios';
import ApiEndpoint from '@/api/api-endpoint';

export default function CacheInitializer() {
  useEffect(() => {
    Promise.allSettled([
      axios.get(ApiEndpoint.ACCOUNT),
      axios.get(ApiEndpoint.SITE_ALL),
      axios.get(ApiEndpoint.MEMBER_ALL),
      axios.get(ApiEndpoint.SUPPLIER),
      axios.get(ApiEndpoint.TUBE_CONTENT_ALL),
      axios.get(ApiEndpoint.TUBE_ACTIVITY_REPORT),
    ]);
  }, []);

  return null;
}