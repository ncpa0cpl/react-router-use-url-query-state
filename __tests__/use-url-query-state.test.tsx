import { act, renderHook, WrapperComponent } from "@testing-library/react-hooks";
import * as H from "history";
import React from "react";
import { useHistory, useLocation } from "react-router";
import { Router } from "react-router-dom";
import { useURLQueryState } from "../src";
import { getParamsMap, ParamsMap } from "./helpers";

const Wrapper: React.FC<{
  before: (location: H.Location, history: H.History) => void;
  onParamChange: (params: string) => void;
}> = ({ children, before, onParamChange }) => {
  const [ready, setReady] = React.useState(false);

  const history = useHistory();
  const location = useLocation();

  React.useEffect(() => {
    before(location, history);
    setReady(true);
  }, []);

  React.useEffect(() => {
    onParamChange(history.location.search);
  }, [history.location.search]);

  if (!ready) return <></>;
  return <>{children}</>;
};

describe("useURLQueryState()", () => {
  let history: H.History;
  let provider: WrapperComponent<unknown>;
  let beforeChildRender = jest.fn((location: H.Location, history: H.History) => {});
  let onParamsChange = jest.fn((params: string) => {});

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();

    history = H.createBrowserHistory();

    history.replace({
      pathname: "localhost",
      search: "",
    });

    provider = ({ children }) => (
      <Router history={history}>
        <Wrapper before={beforeChildRender} onParamChange={onParamsChange}>
          {children}
        </Wrapper>
      </Router>
    );
  });

  describe("with string values", () => {
    it("should return the initial value", () => {
      const param = renderHook(() => useURLQueryState("foo", "abc"), {
        wrapper: provider,
      });

      expect(param.result.current[0]).toEqual("abc");
    });

    it("should correctly update the state and the uri", () => {
      let currentParams: ParamsMap = new Map();

      onParamsChange.mockImplementation((params) => {
        currentParams = getParamsMap(params);
      });

      const param = renderHook(() => useURLQueryState("foo", "abc"), {
        wrapper: provider,
      });

      expect(param.result.current[0]).toEqual("abc");

      act(() => {
        param.result.current[1]("Hello");
      });

      expect(param.result.current[0]).toEqual("Hello");

      expect(currentParams.get("foo")).toEqual("Hello");
    });

    it("should correctly update the state and the uri via set generator", () => {
      let currentParams: ParamsMap = new Map();

      onParamsChange.mockImplementation((params) => {
        currentParams = getParamsMap(params);
      });

      const param = renderHook(() => useURLQueryState("foo", "abc"), {
        wrapper: provider,
      });

      expect(param.result.current[0]).toEqual("abc");

      act(() => {
        param.result.current[1]((old) => `${old}-def`);
      });

      expect(param.result.current[0]).toEqual("abc-def");

      expect(currentParams.get("foo")).toEqual("abc-def");
    });

    it("should get initial values from the uri if present", () => {
      beforeChildRender.mockImplementation((l, h) => {
        h.replace({
          pathname: h.location.pathname,
          search: "?foo=barbaz",
        });
      });

      const param = renderHook(() => useURLQueryState("foo", "abc"), {
        wrapper: provider,
      });

      expect(param.result.current[0]).toEqual("barbaz");
    });

    it("multiple instances of the same name should affect each other", () => {
      const param = renderHook(
        () => ({
          h1: useURLQueryState("foo", "abc"),
          h2: useURLQueryState("foo", "abc"),
        }),
        {
          wrapper: provider,
        }
      );

      expect(param.result.current.h1[0]).toEqual("abc");
      expect(param.result.current.h2[0]).toEqual("abc");

      param.result.current.h1[1]("qux");

      expect(param.result.current.h1[0]).toEqual("qux");
      expect(param.result.current.h2[0]).toEqual("qux");
    });

    it("setting state to a empty string should remove it from the uri", () => {
      const param = renderHook(() => useURLQueryState("foo", "abc"), {
        wrapper: provider,
      });

      param.result.current[1]("barbazqux");

      let params = getParamsMap(history.location.search);

      expect(params.get("foo")).toEqual("barbazqux");

      param.result.current[1]("");

      params = getParamsMap(history.location.search);

      expect(params.has("foo")).toEqual(false);
    });
  });

  describe("with string array values", () => {
    it("should return the initial value", () => {
      const param = renderHook(() => useURLQueryState("foo", ["abc", "def"]), {
        wrapper: provider,
      });

      expect(param.result.current[0]).toEqual(["abc", "def"]);
    });

    it("should correctly update the state and the uri", () => {
      let currentParams: ParamsMap = new Map();

      onParamsChange.mockImplementation((params) => {
        currentParams = getParamsMap(params);
      });

      const param = renderHook(() => useURLQueryState("foo", ["abc", "def"]), {
        wrapper: provider,
      });

      expect(param.result.current[0]).toEqual(["abc", "def"]);

      act(() => {
        param.result.current[1](["Hello", "World"]);
      });

      expect(param.result.current[0]).toEqual(["Hello", "World"]);

      expect(currentParams.get("foo")).toEqual(["Hello", "World"]);
    });

    it("should correctly update the state and the uri via set generator", () => {
      let currentParams: ParamsMap = new Map();

      onParamsChange.mockImplementation((params) => {
        currentParams = getParamsMap(params);
      });

      const param = renderHook(() => useURLQueryState("foo", ["abc", "def"]), {
        wrapper: provider,
      });

      expect(param.result.current[0]).toEqual(["abc", "def"]);

      act(() => {
        param.result.current[1]((old) => [...old, "ghi", "jkl"]);
      });

      expect(param.result.current[0]).toEqual(["abc", "def", "ghi", "jkl"]);

      expect(currentParams.get("foo")).toEqual(["abc", "def", "ghi", "jkl"]);
    });

    it("should get initial values from the uri if present", () => {
      beforeChildRender.mockImplementation((l, h) => {
        h.replace({
          pathname: h.location.pathname,
          search: "?foo=bar&foo=baz",
        });
      });

      const param = renderHook(() => useURLQueryState("foo", ["abc"]), {
        wrapper: provider,
      });

      expect(param.result.current[0]).toEqual(["bar", "baz"]);
    });

    it("multiple instances of the same name should affect each other", () => {
      const param = renderHook(
        () => ({
          h1: useURLQueryState("foo", []),
          h2: useURLQueryState("foo", ["abc", "def"]),
        }),
        {
          wrapper: provider,
        }
      );

      expect(param.result.current.h1[0]).toEqual(["abc", "def"]);
      expect(param.result.current.h2[0]).toEqual(["abc", "def"]);

      param.result.current.h1[1](["qux", "corg"]);

      expect(param.result.current.h1[0]).toEqual(["qux", "corg"]);
      expect(param.result.current.h2[0]).toEqual(["qux", "corg"]);
    });

    it("setting state to a empty string should remove it from the uri", () => {
      const param = renderHook(() => useURLQueryState("foo", ["abc"]), {
        wrapper: provider,
      });

      param.result.current[1](["bar", "baz", "qux"]);

      let params = getParamsMap(history.location.search);

      expect(params.get("foo")).toEqual(["bar", "baz", "qux"]);

      param.result.current[1]([]);

      params = getParamsMap(history.location.search);

      expect(params.has("foo")).toEqual(false);
    });
  });
});
