import React from "react";
import "../BarChart.scss";
import {useTransition, animated} from "react-spring";
import {LocationSegment} from "../index";
import canada from "src/assets/canada.svg";
import university from "src/assets/university.svg";

interface HeaderProps {
  locationSegments: LocationSegment[];
  currentSegmentIndex: number;
}

const Header: React.FC<HeaderProps> = ({
  locationSegments,
  currentSegmentIndex,
}) => {
  const transitions = useTransition(currentSegmentIndex, {
    key: currentSegmentIndex,
    from: {opacity: 0, transform: "translate(100%)"},
    enter: {opacity: 1, transform: "translate(0%)"},
    leave: {opacity: 0, transform: "translate(-100%)"},
    config: {mass: 1, tension: 120, friction: 30},
  });

  return (
    <div className={"segment-wrapper"}>
      {transitions((style: Object, i: number) => (
        <animated.div
          className={"segment"}
          style={{
            ...style,
          }}
        >
          <img
            className={"segment-img"}
            src={
              locationSegments[i].accessor === "canada_average"
                ? canada
                : university
            }
            alt={`${locationSegments[i].accessor}`}
          />
          <h3 className={"segment-title"}>{locationSegments[i].text}</h3>
        </animated.div>
      ))}
    </div>
  );
};

export default Header;
