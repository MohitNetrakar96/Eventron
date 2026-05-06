import React from 'react';
import Header from './components/header';
import Footer from './components/footer';
import AdminForm from './components/form';
import BackgroundBlobs from './components/Backgroundblobs';
import './styles/style.css';

const App = () => {
  return (
    <div className="app">
      <BackgroundBlobs />
      <Header />
      <main className="main-content">
        <div className="container">
          <AdminForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;