import React, {useMemo} from "react";
import "../BarChart.scss";
import {CRIData, StudentSegment, StudentType} from "../index";
import {scaleBand, scaleLinear, scaleOrdinal} from "@visx/scale";
import {withParentSize} from "@visx/responsive";
import {GridRows, GridColumns} from "@visx/grid";
import {Group} from "@visx/group";
import {Bar, BarGroupHorizontal} from "@visx/shape";
import {AxisBottom, AxisLeft} from "@visx/axis";
import {Text} from "@visx/text";
import {LinearGradient} from "@visx/gradient";
import {LegendOrdinal, LegendItem, LegendLabel} from "@visx/legend";

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
  let canada_accessor = data.location_segments[0].accessor;
  // Set sizes based on parent element's bounding box.
  const sizes = {
    w: parentWidth || 400,
    h: parentWidth || 400,
  };
  const margins = {left: 200, right: 50, top: 0, bottom: 50};

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
        university_average: 0,
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
    let [students_min, students_max] = [
      0,
      Math.round(getStudentsMinMax()[1] / 50) * 50, // round up to nearest 50
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

  // Determines the y value of the bars within each bar group
  const locationScale = scaleBand({
    domain: selectedLocationIndex === 0 ? [canada_accessor] : bar_keys,
    padding: 0.5,
  }).rangeRound([0, axes.studentTypes.scale.bandwidth()]);

  // Color scale for bar fill and bar label fonts.
  const colorScale = scaleOrdinal({
    domain: bar_keys,
    // range: ["url('bar-red')", "rgb(16, 33, 52)"],
    range: [
      {fill: "url('#redGradient')", font: "rgb(229, 74, 53)"},
      {fill: "url('#blueGradient')", font: "rgb(16, 33, 52)"},
    ],
  });

  // Legend Scale
  const threshold = scaleOrdinal({
    domain: bar_keys,
    range: colorScale.range().map(c => c.fill),
  });
  return (
    <div className={"bars"} style={{}}>
      <svg width={sizes.w} height={sizes.h}>
        <LinearGradient
          id="redGradient"
          from={"#e54a35"}
          to={"#FD8F86"}
          vertical={false}
        />
        <LinearGradient
          id="blueGradient"
          from={"#102134"}
          to={"#265182"}
          vertical={false}
        />
        {/* <LinearGradient id="area-gradient" from={accentColor} to={accentColor} toOpacity={0.1} /> */}
        <Group transform={`translate(${margins.left},${margins.top})`}>
          <Group className={"grid-line"}>
            <Group top={0 - axes.studentTypes.scale.bandwidth() / 4}>
              <GridRows
                width={max_w}
                height={max_h}
                scale={axes.studentTypes.scale}
                offset={0 - axes.studentTypes.scale.bandwidth() / 2}
                tickValues={axes.studentTypes.values}
              ></GridRows>
              <line x1={0} x2={max_w} y1={max_h} y2={max_h} />
            </Group>
            <GridColumns
              width={max_w}
              top={0 + axes.studentTypes.scale.bandwidth() / 4}
              height={max_h - axes.studentTypes.scale.bandwidth() / 2}
              scale={axes.studentNums.scale}
              numTicks={5}
              // tickValues={axes.studentNums.values}
            ></GridColumns>
          </Group>

          <BarGroupHorizontal
            data={bars_data}
            keys={bar_keys}
            width={max_w}
            y0={d => d.student_type}
            y0Scale={axes.studentTypes.scale}
            y1Scale={locationScale}
            xScale={axes.studentNums.scale}
            color={d => colorScale(d).fill}
          >
            {barGroups =>
              barGroups.map(barGroup => {
                return (
                  <Group key={`bar_id_${barGroup.index}`} top={barGroup.y0}>
                    {barGroup.bars.reverse().map(bar => {
                      // Checks if the current bar is part of the canada only view
                      // Booleans assigning which data should be emphasized.
                      const showOnlyCanada = selectedLocationIndex === 0;
                      const showUniversities = selectedLocationIndex !== 0;
                      return (
                        <Group
                          key={`bar-${barGroup.index}-${bar.index}`}
                          style={{
                            opacity:
                              showUniversities && bar.key === canada_accessor
                                ? 0.75
                                : 1,
                          }}
                        >
                          <Text
                            className={"bar-label"}
                            key={`bar-text-${barGroup.index}-${bar.index}`}
                            verticalAnchor={"middle"}
                            dx={"0.5em"}
                            stroke={colorScale(bar.key).font}
                            style={{
                              transform: `translate(${bar.width}px, ${
                                bar.y + bar.height / 2
                              }px)`,
                              fontSize:
                                showOnlyCanada && bar.key !== canada_accessor
                                  ? 0
                                  : "13px",
                            }}
                          >
                            {`${bar.value}%`}
                          </Text>
                          <Bar
                            key={`bar-${barGroup.index}-${bar.index}`}
                            x={bar.x}
                            y={
                              selectedLocationIndex === 0
                                ? locationScale(canada_accessor)
                                : bar.y
                            }
                            color={bar.color}
                            width={bar.width}
                            height={bar.height}
                            fill={colorScale(bar.key).fill}
                            opacity={
                              showOnlyCanada && bar.key !== canada_accessor
                                ? 0.75
                                : 1
                            }
                            rx={bar.height / 2}
                          ></Bar>
                        </Group>
                      );
                    })}
                  </Group>
                );
              })
            }
          </BarGroupHorizontal>
          <AxisLeft
            axisClassName="axis-left"
            scale={axes.studentTypes.scale}
            hideTicks
            hideAxisLine
          >
            {props => {
              return props.ticks.map((label, i) => {
                const {x, y} = label.from;
                return (
                  <Text
                    className="axis-label"
                    key={i}
                    x={x}
                    y={y}
                    dx={-15}
                    verticalAnchor={"middle"}
                    textAnchor={"end"}
                    width={margins.left}
                    lineHeight={"1.4em"}
                  >
                    {label.value}
                  </Text>
                );
              });
            }}
          </AxisLeft>
          <AxisBottom
            axisClassName="axis-bottom"
            scale={axes.studentNums.scale}
            top={max_h}
            numTicks={5}
            tickLabelProps={() => ({
              className: "axis-label",
              textAnchor: "middle",
              dy: -5,
              dx: "0.5em",
            })}
            tickFormat={v => {
              return `${v}%`;
            }}
            hideTicks
            hideAxisLine
          />
        </Group>
      </svg>
      <LegendOrdinal scale={threshold}>
        {labels => {
          return (
            <div className={"legend"}>
              {labels.map((label, i) => {
                let text = label.text;
                const location = data.location_segments.filter(
                  segment => segment.accessor === label.text,
                );
                if (location.length > 0) {
                  text = location[0].text;
                } else {
                  text = "Universities";
                }
                const size = 15;
                return (
                  <LegendItem key={i} margin="10px 0 0 0">
                    <svg width={size} height={size}>
                      <rect fill={label.value} width={size} height={size} />
                    </svg>
                    <LegendLabel
                      className={"label"}
                      align="left"
                      margin="0 0 0 10px"
                    >
                      {text}
                    </LegendLabel>
                  </LegendItem>
                );
              })}
            </div>
          );
        }}
      </LegendOrdinal>
    </div>
  );
};

export default withParentSize(Bars);
