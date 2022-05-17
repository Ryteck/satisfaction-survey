import { NextPage } from 'next';
import { AppProps } from 'next/app';
import 'react-confirm-alert/src/react-confirm-alert.css';
import 'react-datepicker/dist/react-datepicker.css';
import { Toaster } from 'react-hot-toast';
import '../globals.css';

const MyNextApp: NextPage<AppProps> = ({ Component, pageProps }) => (
  <>
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-gray-900">
      <Component {...pageProps} />
    </div>
    <Toaster
      position="top-right"
    />
  </>
);

export default MyNextApp;
