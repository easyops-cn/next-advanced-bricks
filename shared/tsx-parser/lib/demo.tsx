/* eslint-disable */
// @ts-nocheck

// index.tsx
import { render, Routes, Route } from "next-tsx";

render(
  <Routes>
    <Route path="/" component={Layout} />
    <Route path="/404" component={Page404} />
  </Routes>
);

// pages/Layout.tsx
function Layout() {
  return (
    <>
      <h1>Home</h1>
      <Nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </Nav>
      <Card>
        <h2 slot="header">Welcome</h2>
        <Routes slot="body">
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
        </Routes>
      </Card>
    </>
  );
}

// pages/Page404.tsx
function Page404() {
  return <h1>404 Not Found</h1>;
}

// components/Nav.tsx
function Nav() {
  return (
    <nav>
      <slot />
    </nav>
  );
}

// utils/sayHello.ts
function sayHello(name: string) {
  return `Hello, ${name}!`;
}
