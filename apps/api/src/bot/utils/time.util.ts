export const timeToMilliseconds = (time: string) => {
  const parts = time.split(':').map(Number);

  const timeSeconds =
    parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];

  return timeSeconds * 1000;
};

export const formatMilliseconds = (milliseconds: number) => {
  const hours = Math.floor((milliseconds / (60 * 60 * 1000)) % 60);
  const minutes = Math.floor((milliseconds / (60 * 1000)) % 60);
  const seconds = Math.floor((milliseconds / 1000) % 60);

  return `${hours ? `${hours.toString().padStart(2, '0')}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
