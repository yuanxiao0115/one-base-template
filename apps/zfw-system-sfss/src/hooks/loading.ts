import { ref } from 'vue';

export default function useLoading(initial = false) {
  const loading = ref(Boolean(initial));

  function setLoading(value: boolean) {
    loading.value = value;
  }

  return {
    loading,
    setLoading
  };
}
