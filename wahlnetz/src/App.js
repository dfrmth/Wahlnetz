import React, { useState } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  Legend
} from 'recharts';
import partyData from './data/parties.json';
import './App.css';

// Die Themenfragen, die nacheinander abgefragt werden
const questions = [
  { id: 0, topic: "Außenpolitik", question: "Außenpolitik: militarisch (1) oder diplomatisch (10)" },
  { id: 1, topic: "Innenpolitik", question: "Innenpolitik: Kontrolle (1) oder Freiheit (10)" },
  { id: 2, topic: "Migration", question: "Migration: restriktiv (1) oder offen (10)" },
  { id: 3, topic: "Bürgergeld/Armut/Wohnen", question: "Bürgergeld/Armut/Wohnen: individuell (1) oder staatlich (10)" },
  { id: 4, topic: "Arbeit", question: "Arbeit: arbeitgeberfreundlich (1) oder arbeitnehmerfreundlich (10)" },
  { id: 5, topic: "Rente", question: "Rente: privat (1) oder öffentlich (10)" },
  { id: 6, topic: "Pflege", question: "Pflege: Markt (1) oder Solidarität (10)" },
  { id: 7, topic: "Kinder", question: "Kinder: individuell (1) oder staatlich (10)" },
  { id: 8, topic: "Bildung", question: "Bildung: individuell (1) oder staatlich (10)" },
  { id: 9, topic: "Sport", question: "Sport: individuell (1) oder staatlich (10)" },
  { id: 10, topic: "Kultur", question: "Kultur: staatlich (1) oder individuell (10)" },
  { id: 11, topic: "Schuldenbremse/Haushalt", question: "Schuldenbremse/Haushalt: Sparen (1) oder Investieren (10)" },
  { id: 12, topic: "Steuern", question: "Steuern: Wachstum (1) oder Umverteilung (10)" },
  { id: 13, topic: "Klima-/Energiepolitik", question: "Klima-/Energiepolitik: wenig (1) oder viel (10)" }
];

function App() {
  // Schritte: 'welcome' → 'questions' → 'result'
  const [step, setStep] = useState('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(questions.length).fill(null));
  
  // Filter-Zustände: Für Parteien und Themen (alle per Default aktiv)
  const [partyFilters, setPartyFilters] = useState(() => {
    const filters = {};
    Object.keys(partyData).forEach(party => {
      filters[party] = true;
    });
    return filters;
  });
  const [topicFilters, setTopicFilters] = useState(() => {
    const filters = {};
    questions.forEach(q => {
      filters[q.topic] = true;
    });
    return filters;
  });
  
  // Antwort des Nutzers verarbeiten
  const handleAnswer = (value) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = value;
    setUserAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep('result');
    }
  };
  
  // Daten für das Radar-Diagramm zusammenbauen
  const buildChartData = () => {
    return questions.filter(q => topicFilters[q.topic]).map((q, index) => {
      const dataPoint = {
        topic: q.topic,
        user: userAnswers[index]
      };
      // Für jede aktivierte Partei den entsprechenden Wert hinzufügen
      Object.keys(window.partyData || {}).forEach(() => {}); // Dummy-Zeile, da wir die Daten direkt importieren!
      // Wir nutzen hier den Import aus der JSON-Datei:
      Object.keys(partyData).forEach(party => {
        if (partyFilters[party]) {
          dataPoint[party] = partyData[party][index];
        }
      });
      return dataPoint;
    });
  };
  
  // Ermittelt pro Thema, welche Partei(en) den höchsten Wert haben
  const computeLeadingParty = (index) => {
    let maxVal = -Infinity;
    let leaders = [];
    Object.keys(partyData).forEach(party => {
      const val = partyData[party][index];
      if (val > maxVal) {
        maxVal = val;
        leaders = [party];
      } else if (val === maxVal) {
        leaders.push(party);
      }
    });
    return leaders.join(', ');
  };

  // Rendern der verschiedenen Phasen
  if (step === 'welcome') {
    return (
      <div className="container">
        <header>
          <div className="logo-placeholder">LOGO</div>
        </header>
        <main className="welcome-box">
          <h1>Willkommen bei der Wahlspinne!</h1>
          <p>
            Webe dir dein politisches Netz und vergleiche es mit den Bundestagsparteien.
            Klicke auf den Pfeil, um loszulegen.
          </p>
          <button onClick={() => setStep('questions')} className="arrow-button">
            ➡️
          </button>
        </main>
      </div>
    );
  }
  
  if (step === 'questions') {
    const currentQ = questions[currentQuestion];
    return (
      <div className="container">
        <header>
          <div className="logo-placeholder">LOGO</div>
        </header>
        <main className="question-box">
          <h2>{currentQ.question}</h2>
          <div className="options">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => handleAnswer(num)}
                className="option-button"
              >
                {num}
              </button>
            ))}
          </div>
          <p>Frage {currentQuestion + 1} von {questions.length}</p>
        </main>
      </div>
    );
  }
  
  if (step === 'result') {
    const chartData = buildChartData();
    
    // Filter umschalten
    const togglePartyFilter = (party) => {
      setPartyFilters({ ...partyFilters, [party]: !partyFilters[party] });
    };
    const toggleTopicFilter = (topic) => {
      setTopicFilters({ ...topicFilters, [topic]: !topicFilters[topic] });
    };
    
    return (
      <div className="container">
        <header>
          <div className="logo-placeholder">LOGO</div>
        </header>
        <main className="result-page">
          <section className="filter-panel">
            <h3>Filter Parteien</h3>
            <div className="checkbox-group">
              {Object.keys(partyFilters).map(party => (
                <label key={party}>
                  <input
                    type="checkbox"
                    checked={partyFilters[party]}
                    onChange={() => togglePartyFilter(party)}
                  />
                  {party}
                </label>
              ))}
            </div>
            <h3>Filter Themen</h3>
            <div className="checkbox-group">
              {questions.map(q => (
                <label key={q.topic}>
                  <input
                    type="checkbox"
                    checked={topicFilters[q.topic]}
                    onChange={() => toggleTopicFilter(q.topic)}
                  />
                  {q.topic}
                </label>
              ))}
            </div>
          </section>
          
          <section className="chart-overview">
            <div className="chart-container">
              <RadarChart
                cx={250}
                cy={250}
                outerRadius={150}
                width={500}
                height={500}
                data={chartData}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="topic" />
                <Tooltip />
                <Legend />
                <Radar
                  name="Du"
                  dataKey="user"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.7}
                />
                {Object.keys(partyData).map(party =>
                  partyFilters?.[party] && (
                    <Radar
                      key={party}
                      name={party}
                      dataKey={party}
                      stroke={
                        party === "Union"
                          ? "#000000"
                          : party === "AfD"
                          ? "#0489DB"
                          : party === "SPD"
                          ? "#E3000F"
                          : party === "Grüne"
                          ? "#1AA037"
                          : party === "Linke"
                          ? "#E3000F"
                          : party === "FDP"
                          ? "#FFEF00"
                          : party === "BSW"
                          ? "#792351"
                          : "#00C49F"
                      }
                      fillOpacity={0}
                    />
                  )
                )}
              </RadarChart>
            </div>
            
            <div className="overview-table">
              <h3>Themen & führende Parteien</h3>
              <table>
                <thead>
                  <tr>
                    <th>Thema</th>
                    <th>Führende Partei(en)</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, index) =>
                    topicFilters[q.topic] && (
                      <tr key={q.topic}>
                        <td>{q.topic}</td>
                        <td>{computeLeadingParty(index)}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
          
          <section className="share-section">
            <button
              onClick={() => {
                const shareText = encodeURIComponent("Schau dir mein Wahlnetz an!");
                const shareUrl = encodeURIComponent(window.location.href);
                window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, "_blank");
              }}
            >
              Auf Twitter teilen
            </button>

            <button
              onClick={() => {
                const shareUrl = encodeURIComponent(window.location.href);
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, "_blank");
              }}
            >
              Auf Facebook teilen
            </button>

            <button
              onClick={() => {
                const shareText = encodeURIComponent("Schau dir mein Wahlnetz an: " + window.location.href);
                window.open(`https://api.whatsapp.com/send?text=${shareText}`, "_blank");
              }}
            >
              Über WhatsApp teilen
            </button>
          </section>
        </main>
      </div>
    );
  }
  
  return null;
}

export default App;
