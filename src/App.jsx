import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Products from './pages/Products';
import Decks from './pages/Decks';
import DeckDetail from './pages/DeckDetail';
import Content from './pages/Content';
import About from './pages/About';
import Support from './pages/Support';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/',              element: <Landing /> },
      { path: '/products',      element: <Products /> },
      { path: '/decks',         element: <Decks /> },
      { path: '/decks/:slug',   element: <DeckDetail /> },
      { path: '/content',       element: <Content /> },
      { path: '/blog',          element: <Blog /> },
      { path: '/blog/:slug',    element: <BlogPost /> },
      { path: '/about',         element: <About /> },
      { path: '/support',       element: <Support /> },
      { path: '/contact',       element: <Contact /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
