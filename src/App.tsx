import { ReportForm } from "./components/ReportForm";

export default function App() {
  return (
    <div className="page">
      <header className="header">
        <h1 className="logo">achoo</h1>
        <p className="tagline">How bad are your allergies today?</p>
      </header>

      <main className="main">
        <ReportForm />
      </main>

      <footer className="footer">Anonymous · no account · once a day</footer>
    </div>
  );
}
