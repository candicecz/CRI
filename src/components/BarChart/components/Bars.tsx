import React, {useMemo} from "react";
import "../BarChart.scss";
import {CRIData, StudentSegment, StudentType} from "../index";
import {scaleBand, scaleLinear, scaleOrdinal} from "@visx/scale";
import {withParentSize} from "@visx/responsive";
import {Grid, GridRows, GridColumns} from "@visx/grid";
import {Group} from "@visx/group";
import {Bar, BarGroupHorizontal} from "@visx/shape";

type BarProps = {
  data: CRIData;
  selectedLocationIndex: number;
  parentHeight?: number;
  parentWidth?: number;
  debounceTime?: number;
  enableDebounceLeadingCall?: boolean;
};

type BarsVizData = {
  student_type: StudentType;
  canada_average: number;
  university_average?: number;
};

const Bars: React.FC<BarProps> = ({
  parentWidth,
  data,
  selectedLocationIndex,
}) => {
  // Set sizes based on parent element's bounding box.
  const sizes = {
    w: parentWidth || 400,
    h: parentWidth || 400,
  };
  const margins = {left: 50, right: 50, top: 50, bottom: 50};

  // Get the size of this chart with margins accounted for.
  const max_w = sizes.w - margins.left - margins.right;
  const max_h = sizes.h - margins.top - margins.bottom;

  // Format the data expected for the bars
  const bars_data: BarsVizData[] = data.student_segments.map(
    (segment: StudentSegment) => {
      const current_segment =
        data.location_segments[selectedLocationIndex].accessor;
      let bars_data: BarsVizData = {
        student_type: segment.student_type,
        canada_average: +segment.canada_average,
        // university_average: 0,
      };
      if (selectedLocationIndex !== 0) {
        bars_data = {
          ...bars_data,
          university_average: +segment[current_segment],
        };
      }
      return bars_data;
    },
  );

  // All the student types
  let student_types = bars_data.map(d => d.student_type);

  let bar_keys = Object.keys(bars_data[0]).filter(d => d !== "student_type");

  // Sets up axes and scales.
  const axes = useMemo(() => {
    // Get the min and max of students in each type.
    let getStudentsMinMax: () => number[] = () => {
      let values = data.student_segments
        .map(d => Object.values(d))
        .flat()
        .filter((d): d is number => typeof d === "number");
      return [Math.min(...values), Math.max(...values)];
    };
    // min max num of students of a certain type
    let [min, max] = getStudentsMinMax();
    let [students_min, students_max] = [
      0,
      Math.round(max * 50) / 50, // round up to nearest 50
    ];

    // numStudentsScale(x-axis) is based the number(in percent) of students of a particular type in a location.
    const studentNumScale = scaleLinear({
      domain: [students_min, students_max],
      range: [0, max_w],
    });

    // studentTypeScale(y-axis) is the different type of students polled.
    const studentTypeScale = scaleBand({
      domain: student_types,
      range: [0, max_h],
      padding: 0.3,
    });

    return {
      studentNums: {
        scale: studentNumScale,
        values: [students_min, students_max / 2, students_max],
        tickFormat: (v: any) => `${v}%`,
        label: "Student Population (percentage)",
      },
      studentTypes: {
        scale: studentTypeScale,
        values: student_types,
        label: "Types of student",
      },
    };
  }, [max_w, student_types, max_h, data.student_segments]);
  const locationScale = scaleBand({
    domain: bar_keys,
    padding: 0.5,
  }).rangeRound([0, axes.studentTypes.scale.bandwidth()]);

  const colorScale = scaleOrdinal({
    domain: bar_keys,
    range: ["rgb(229, 74, 53)", "rgb(16, 33, 52)"],
  });
  return (
    <svg className={"bars"} width={sizes.w} height={sizes.h}>
      <Group transform={`translate(${margins.left},${margins.top})`}>
        {/* <GridRows
        scale={axes.yScale.scale}
        stroke="#e0e0e0"
        width={max_w}
        tickValues={axes.yScale.values}
      ></GridRows>
      <GridColumns
        scale={axes.xScale.scale}
        stroke="#e0e0e0"
        height={max_h}
        tickValues={axes.xScale.values}
      ></GridColumns> */}
        <BarGroupHorizontal
          data={bars_data}
          keys={bar_keys}
          width={max_w}
          y0={d => d.student_type}
          y0Scale={axes.studentTypes.scale}
          y1Scale={locationScale}
          xScale={axes.studentNums.scale}
          color={colorScale}
        >
          {barGroups =>
            barGroups.map(barGroup => {
              return (
                <Group key={`bar_id_${barGroup.index}`} top={barGroup.y0}>
                  {barGroup.bars.map(bar => {
                    return (
                      <Bar
                        key={`bar-group-bar-${barGroup.index}-${bar.index}`}
                        x={bar.x}
                        y={bar.y}
                        width={bar.width}
                        height={bar.height}
                        fill={bar.color}
                        rx={bar.height / 2}
                      ></Bar>
                    );
                  })}
                </Group>
              );
            })
          }
        </BarGroupHorizontal>
      </Group>
    </svg>
  );
};

export default withParentSize(Bars);
