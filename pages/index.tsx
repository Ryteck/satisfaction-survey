import axios from 'axios';
import { NextPage } from 'next';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const COUNTDOWN_INITIAL_SECONDS = 15;
const ONE_SECOND = 1000;

type NoteValue = 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';

type NoteComponentProps = {
  value: NoteValue;
  // eslint-disable-next-line no-unused-vars
  onClick: (value: NoteValue) => () => void;
  imageUrl: string;
}

const NoteComponent: FC<NoteComponentProps> = ({ value, onClick, imageUrl }) => (
  <Image
    className="cursor-pointer"
    onClick={onClick(value)}
    src={imageUrl}
    width={138}
    height={230}
  />
);

const IndexPage: NextPage = () => {
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);

  useEffect(() => {
    if (countdownSeconds > 0) {
      setTimeout(() => {
        setCountdownSeconds(countdownSeconds - 1);
      }, ONE_SECOND);
    } else {
      setIsCountdownRunning(false);
    }
  }, [countdownSeconds]);

  const onClick = (value: NoteValue) => async () => {
    if (isCountdownRunning) {
      toast.error('Aguarde o fim do contador');
      return;
    }

    const response = confirm('Deseja enviar a nota?');
    if (!response) {
      toast('Nota não enviada');
      return;
    }

    try {
      await axios.post('/api/shortAnswers', { value });
      toast.success('Nota enviada');
    } catch (err) {
      toast.error(`Erro ao enviar a nota: ${err.message}`);
    } finally {
      setIsCountdownRunning(true);
      setCountdownSeconds(COUNTDOWN_INITIAL_SECONDS);
    }
  };

  return (
    <>
      <h1 className="pt-8 text-5xl text-white">O que você achou do atendimento?</h1>

      <div className="flex justify-around items-center w-full h-full">
        <NoteComponent value="ONE" onClick={onClick} imageUrl="/1.png" />
        <NoteComponent value="TWO" onClick={onClick} imageUrl="/2.png" />
        <NoteComponent value="THREE" onClick={onClick} imageUrl="/3.png" />
        <NoteComponent value="FOUR" onClick={onClick} imageUrl="/4.png" />
        <NoteComponent value="FIVE" onClick={onClick} imageUrl="/5.png" />
      </div>

      <footer className="flex justify-center items-center w-full h-80 text-white">
        <span className={`h-40 w-40 p-3 flex justify-center items-center font-mono text-8xl rounded-full ${isCountdownRunning ? 'bg-red-500' : 'bg-green-500'}`}>
          {String(countdownSeconds).padStart(2, '0')}
        </span>
      </footer>
    </>
  );
};

export default IndexPage;
