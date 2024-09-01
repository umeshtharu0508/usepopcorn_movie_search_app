import { useState, useEffect } from "react";
import "./styles.css";
export default function App() {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [convertedCurrency, setConvertedCurrency] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // `https://api.frankfurter.app/latest?amount=100&from=EUR&to=USD`

  useEffect(
    function () {
      async function conversion() {
        setIsLoading(true);
        const response = await fetch(
          `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
        );
        const data = await response.json();
        console.log(data.rates[toCurrency]);
        setConvertedCurrency(data.rates[toCurrency]);
        setIsLoading(false);
      }
      if (fromCurrency === toCurrency) {
        setConvertedCurrency(amount);
        return;
      }

      conversion();
    },
    [amount, fromCurrency, toCurrency]
  );
  return (
    <div className="App">
      <h2>Currency-Convertor App</h2>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isLoading}
      />
      <select
        value={fromCurrency}
        onChange={(e) => setFromCurrency(e.target.value)}
        disabled={isLoading}
      >
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="CAD">CAD</option>
        <option value="INR">INR</option>
      </select>
      <select
        value={toCurrency}
        onChange={(e) => setToCurrency(e.target.value)}
        disabled={isLoading}
      >
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="CAD">CAD</option>
        <option value="INR">INR</option>
      </select>
      <p>
        {convertedCurrency}&nbsp;{toCurrency}
      </p>
    </div>
  );
}
