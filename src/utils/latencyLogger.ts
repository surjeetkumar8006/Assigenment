export function logLatency(label: string, start: number) {
  const duration = Date.now() - start;
  console.log(`⏱️ ${label}: ${duration} ms`);
}
