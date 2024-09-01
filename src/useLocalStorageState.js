import { useState, useEffect } from "react";
export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(function () {
    // const storedValue = localStorage.getItem(JSON.stringify(key)); //using this localStorage is losing it's data on refreshing the page
    const storedValue = localStorage.getItem(key);
    // console.log("from useLocalStorageState's useState() function");
    return storedValue ? JSON.parse(storedValue) : initialState;
  });
  useEffect(
    function () {
      // console.log("from useLocalStorageState's useEffect() function");
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );
  return [value, setValue];
}
// first explaination
// -------------------------
// Hey, I got confused at first too, but this is how I think it works: I would assume that when you create the useLocalStorageState function, you return the "setValue" setter of the useState to the App code as "setWatched" in this code:
// const [watched, setWatched] = useLocalStorageState([], "watched");

// Hence "setWatched" becomes a pointer to the "setValue" (once you call the first, you basically call the other). Once you call "setWatched" from the App it calls "setValue", then the state of "value" changes, and triggers the useEffect in useLocalStorageState, which depends on the "value". I hope I get it right?

// another explaination
//-----------------------
// When you use custom hook inside some component, think about it as if the state of the hook is plugged inside that component. Change of the state of that hook will trigger the re-render of the component that uses that hook.

// Calling the custom hook, in this case - useLocalStorageState, will return a state value and a setter.

// So now you have a way to use a state value, which is the same as if you defined that state inside a component with useState, and also a setter, which is the same as you have setter function returned using a useState, inside your component.  You just exposed two references by retuning them from a custom hook call: one to a state value and second to a state update function and you can use them inside of your component.
// You called a custom hook function, it plugged the state that it uses into a component and it returned you a state value and a update state function to use it inside of an component. That's all.

// And when you change the state value by using a setter function (and that state of a custom hook  is plugged into a component that uses that hook) - it will trigger re-render. And after that, the useEffect will be called (because you changed it's dependency) and it will synchronise the local storage to be the same as the current state value.
