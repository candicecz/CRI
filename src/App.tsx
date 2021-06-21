import React, {useState} from "react";
import BarChart from "src/components/BarChart";
import * as d3 from "d3";
import "./App.scss";
import {CRIData} from "src/components/BarChart";

type ResData = CRIData | null;

// replace all spaces and symbols in string with an underscore.
const format_student_types = (str: string): string => {
  return str.toLowerCase().replace(/[^A-Z0-9]/gi, "_");
};
const format_population_segment = (str: string): string => {
  if (str.includes("univ")) {
    return `University ${str.match(/\d+/g)}`;
  } else if (str === "canada_average") {
    return "Average across Canada";
  } else {
    return str;
  }
};
const App: React.FC = () => {
  const [data, setData] = useState<ResData>(null);
  if (!data) {
    // Retrieve the data and process it for the bar chart.
    d3.csv(`${process.env.PUBLIC_URL}/data/cri-data.csv`).then(data => {
      let processed_data = data.reduce((r: any, d, i): CRIData | {} => {
        let student_bracket: string;
        // Segment of polled population(e.g. university)
        const population_segments = Object.keys(d).filter(
          s => s !== "student_types",
        );

        if (!r["population_segments"]) {
          r["population_segments"] = population_segments.map(segment =>
            format_population_segment(segment),
          );
        }
        // Types of students in polled population
        if (!r["student_types"]) {
          r["student_types"] = [];
        }
        population_segments.map(segment => {
          if (!r[segment]) {
            r[segment] = {};
          }
          return null;
        });
        Object.entries(d).map(([k, v]) => {
          if (k === "student_types") {
            student_bracket = format_student_types(v!);
            return r["student_types"].push(student_bracket);
          } else {
            return (r[k] = {...r[k], [student_bracket]: parseInt(v!)});
          }
        });
        return r;
      }, {});
      setData((prev: any) => {
        if (Object.keys(processed_data).length > 0) {
          return {...prev, ...processed_data};
        }
        return prev;
      });
    });
  }
  if (!data) {
    // Show loading indicator if data is not present
    return <div>loading data...</div>;
  }

  return (
    <div>
      <BarChart data={data} />
    </div>
  );
};

export default App;
