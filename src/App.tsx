import { getAudioDuration } from './util/get-audio-duration';
import { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration)

export default function App() {
  const [acceptedFiles, setAcceptedFiles] = useState<string[]>([]);
  const [durations, setDurations] = useState(0);
  const duration = useMemo(() => dayjs.duration(durations, 'seconds').format('HH:mm:ss'), [durations]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'audio/*': [] },
    onDropAccepted: async (files) => {
      const objectUrls = files.map(file => URL.createObjectURL(file));
      setAcceptedFiles(objectUrls);
      const durationArray = await Promise.all(objectUrls.map(getAudioDuration));
      const durationResult = durationArray.reduce((prev, curr) => prev + curr, 0)
      setDurations(durationResult);
    }
  });

  useEffect(() => () => {
    console.log('revoke urls');
    acceptedFiles.forEach(URL.revokeObjectURL);
  }, [acceptedFiles])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <section className="container bg-slate-400">
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
        </div>
        <aside>
          <h4>Duration</h4>
          <p>
            {duration}
          </p>
        </aside>
      </section>
    </main>
  );
}
