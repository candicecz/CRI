import React, {useState} from "react";
import {useInterval} from "src/hooks/useInterval";
import "./BarChart.scss";
import {useTransition, animated, config} from "react-spring";

export interface CRIStudentBracket {
  conscientious_achievers: number;
  social_extroverts: number;
  anxious_go_getters: number;
  inquisitive_introverts: number;
  success_express: number;
  self_actualizers: number;
  cyber_students: number;
  perpetual_students: number;
}

export interface CRIData {
  population_segments: string[];
  student_types: string[];
  canada_average: CRIStudentBracket;
  univ_01: CRIStudentBracket;
  univ_02: CRIStudentBracket;
  univ_03: CRIStudentBracket;
  univ_04: CRIStudentBracket;
  univ_05: CRIStudentBracket;
}

interface BarChartProps {
  data: CRIData;
}

const BarChart: React.FC<BarChartProps> = ({data}) => {
  const {population_segments, ...rest} = data;
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

  // select a different segment population ever time delay.
  const delay = 5000;
  useInterval(() => {
    setCurrentSegmentIndex(() => {
      // After cycling through all population segments, return to the first segment
      if (currentSegmentIndex === population_segments.length - 1) {
        return 0;
      }
      return currentSegmentIndex + 1;
    });
  }, delay);

  const transitions = useTransition(currentSegmentIndex, {
    key: currentSegmentIndex,
    from: {opacity: 0, transform: "translate(100%)"},
    enter: {opacity: 1, transform: "translate(0%)"},
    leave: {opacity: 0, transform: "translate(-100%)"},
    config: {mass: 1, tension: 120, friction: 30},
  });

  return (
    <div id="barchart">
      <div className={"segment-wrapper"}>
        {transitions((style: Object, i: number) => (
          <animated.div
            className={"segment"}
            style={{
              ...style,
            }}
          >
            <img className={"segment-icon"} src="" alt="" />
            <h5 className={"segment-title"}>{population_segments[i]}</h5>
          </animated.div>
        ))}
      </div>
      <div className={"legend"}></div>
    </div>
  );
};

export default BarChart;
