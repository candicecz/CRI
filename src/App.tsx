import React, {useState} from "react";
import BarChart, {CRIData} from "src/components/BarChart/index";
import * as d3 from "d3";
import "./App.scss";

type ResData = CRIData | null;

// Format the label for the location.
const format_location_string = (str: string): string => {
  if (str.includes("univ")) {
    let location_string = "University";
    // Instead of numbering the universities, let's turn it to letters.
    const alpha = ["A", "B", "C", "D", "E"];
    let num = str.match(/\d+/g);
    if (num) {
      let index = +num[0];
      location_string = location_string + " " + alpha[index - 1];
    }
    return location_string;
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
      let location_segments: {text: string; accessor: string}[];
      let processed_data = data.map(d => {
        // Segment of polled population(e.g. university)
        location_segments = data.columns
          .filter(s => s !== "student_types")
          .map(segment => ({
            text: format_location_string(segment),
            accessor: segment,
          }));

        return Object.entries(d).reduce((r: any, [k, v], i) => {
          if (k === "student_types") {
            r["student_type"] = v;
          } else {
            r[k] = parseInt(v!) || v;
          }
          return r;
        }, {});
      });

      setData((prev: any) => {
        if (Object.keys(processed_data).length > 0) {
          return {
            ...prev,
            location_segments: location_segments,
            student_segments: processed_data,
          };
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
