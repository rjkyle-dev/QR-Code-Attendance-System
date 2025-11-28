import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return <img {...props} src="/Logo.png" alt="App Logo" className="rounded-circle text-white" style={{ width: '100%', height: '100%' }} />;
}
