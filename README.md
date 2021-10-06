# React Router - Use URL Query State

React hook that leverages the React Router to create a state that's synchronized with the query parameters in the browser url.

## Usage

Use just like a React's `useState` hook:

```ts
// for a string value
const [myStateValue, setMyStateValue] = useURLQueryState(
  "parameterName",
  "initialValue"
);

// for a string list value
const [myStateValue, setMyStateValue] = useURLQueryState("parameterName", [
  "initial",
  "values",
]);
```

Value stored in the URL Query State must be either a string or a list of strings. It can be only one of these types, cannot be both.
