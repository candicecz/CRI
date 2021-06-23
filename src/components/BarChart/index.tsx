// INDEX

import React, {useState} from "react";
import {useInterval} from "src/hooks/useInterval";
import Header from "./components/Header";

import "./BarChart.scss";

import Bars from "./components/Bars";

// The types of students poled.
export type StudentType =
  | "Conscientious Achievers"
  | "Social Extroverts"
  | "Anxious Go_getters"
  | "Inquisitive Introverts"
  | "Success Express"
  | "Self Actualizers"
  | "Cyber Students"
  | "Perpetual Students";

type SegmentPopulationAccessor =
  | "student_type"
  | "canada_average"
  | "univ_01"
  | "univ_02"
  | "univ_03"
  | "univ_04"
  | "univ_05";

// The polled location (univ#, country).
export interface LocationSegment {
  accessor: SegmentPopulationAccessor;
  text: string;
}

export type StudentSegment = {
  student_type: StudentType;
  canada_average: number;
  univ_01: number;
  univ_02: number;
  univ_03: number;
  univ_04: number;
  univ_05: number;
};

export interface CRIData {
  location_segments: LocationSegment[];
  student_segments: StudentSegment[];
}

interface BarChartProps {
  data: CRIData;
}

const BarChart: React.FC<BarChartProps> = ({data}) => {
  const {location_segments} = data;
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

  // select a different segment population ever time delay.
  const delay = 5000;
  useInterval(() => {
    setCurrentSegmentIndex(() => {
      // After cycling through all population segments, return to the first segment
      if (currentSegmentIndex === location_segments.length - 1) {
        return 0;
      }
      return currentSegmentIndex + 1;
    });
  }, delay);

  return (
    <div id="barchart">
      {/* <Header
        currentSegmentIndex={currentSegmentIndex}
        locationSegments={location_segments}
      /> */}

      <Bars data={data} selectedLocationIndex={currentSegmentIndex} />
      <div className={"legend"}></div>
    </div>
  );
};

export default BarChart;
