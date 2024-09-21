import logo from './logo.svg';
import './App.css';
import Main from './main3';
import { MoralisProvider } from "react-moralis";
import Footer from './Footer';
import { WalletProvider } from './WalletContext';
import Header from './Header';


function App() {
  return (
    <>
    <Header />
    <div className="bg-black text-white px-[3vw] text-center min-h-screen">
      <section className="max-w-[650px] mx-auto">
        <WalletProvider>
          <Main />
          <Footer />
          {/* Add other sections here */}
        </WalletProvider>
      </section>
    </div>
   </>
  );
}

export default App;


