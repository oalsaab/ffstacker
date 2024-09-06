import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import "/node_modules/react-resizable/css/styles.css";
import "/node_modules/react-grid-layout/css/styles.css";
import { Responsive, WidthProvider } from "react-grid-layout";
import ReactGridLayout from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

function App() {
  //   const [greetMsg, setGreetMsg] = useState("");
  //   const [name, setName] = useState("");

  //   Responsive width
  //   let layouts = {
  //     lg: [
  //       { i: "a", x: 0, y: 0, w: 1, h: 1 },
  //       { i: "b", x: 1, y: 0, w: 1, h: 1 },
  //       { i: "c", x: 2, y: 0, w: 1, h: 1 },
  //       { i: "e", x: 3, y: 0, w: 1, h: 1 },
  //       { i: "f", x: 4, y: 0, w: 1, h: 1 },
  //       { i: "g", x: 5, y: 0, w: 1, h: 1 },
  //     ],
  //     md: [
  //       { i: "a", x: 0, y: 0, w: 1, h: 1 },
  //       { i: "b", x: 1, y: 0, w: 1, h: 1 },
  //       { i: "c", x: 2, y: 0, w: 1, h: 1 },
  //       { i: "e", x: 3, y: 0, w: 1, h: 1 },
  //       { i: "f", x: 4, y: 0, w: 1, h: 1 },
  //       { i: "g", x: 5, y: 0, w: 1, h: 1 },
  //     ],
  //     sm: [
  //       { i: "a", x: 0, y: 0, w: 1, h: 1 },
  //       { i: "b", x: 1, y: 0, w: 1, h: 1 },
  //       { i: "c", x: 2, y: 0, w: 1, h: 1 },
  //       { i: "e", x: 3, y: 0, w: 1, h: 1 },
  //       { i: "f", x: 4, y: 0, w: 1, h: 1 },
  //       { i: "g", x: 5, y: 0, w: 1, h: 1 },
  //     ],
  //   };

  //   async function something() {
  //     let layouts = {
  //       lg: [{ i: "a", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 }],
  //       md: [{ i: "a", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 }],
  //       sm: [{ i: "a", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 }],
  //     };
  //   }

  const layout = [{ i: "b", x: 1, y: 0, w: 3, h: 2 }];

  return (
    <ReactGridLayout
      className="layout"
      layout={layout}
      cols={10}
      rowHeight={30}
      width={400}
      compactType={"vertical"}
      //   measureBeforeMount={true}
      isResizable={false}
      onLayoutChange={(layout) => console.log(layout)}
      //   droppingItem={{ i: "xx", h: 2, w: 2 }}
    >
      <div key="1" style={{ backgroundColor: "green" }}>
        1
      </div>
      <div key="2" style={{ backgroundColor: "green" }}>
        2
      </div>
      <div key="3" style={{ backgroundColor: "green" }}>
        3
      </div>
      <div key="4" style={{ backgroundColor: "green" }}>
        4
      </div>
    </ReactGridLayout>
  );

  //   async function greet() {
  //     // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  //     setGreetMsg(await invoke("greet", { name }));
  //   }

  //   return (
  //     <div className="container">
  //       <h1>Welcome to Tauri!</h1>

  //       <div className="row">
  //         <a href="https://vitejs.dev" target="_blank">
  //           <img src="/vite.svg" className="logo vite" alt="Vite logo" />
  //         </a>
  //         <a href="https://tauri.app" target="_blank">
  //           <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
  //         </a>
  //         <a href="https://reactjs.org" target="_blank">
  //           <img src={reactLogo} className="logo react" alt="React logo" />
  //         </a>
  //       </div>

  //       <p>Click on the Tauri, Vite, and React logos to learn more.</p>

  //       <form
  //         className="row"
  //         onSubmit={(e) => {
  //           e.preventDefault();
  //           greet();
  //         }}
  //       >
  //         <input
  //           id="greet-input"
  //           onChange={(e) => setName(e.currentTarget.value)}
  //           placeholder="Enter a name..."
  //         />
  //         <button type="submit">Greet</button>
  //       </form>

  //       <p>{greetMsg}</p>
  //     </div>
  //   );
}

export default App;
