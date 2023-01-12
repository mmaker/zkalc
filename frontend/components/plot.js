import { ResponsiveLine } from '@nivo/line'
import { InlineMath } from 'react-katex';
import { humanTime } from '../lib/time';
export const samplesToPlotData = (samples, id="name") => {
    const xys = samples.range.filter(x => x> 16).map((x, i) => ({ "x": x, "y": samples.results[i]}));
    return {id, "data": [... xys],         "pointSize": 10};
}

const linspace = (start, stop, num) => {
    const step = (stop - start) / num;
    return Array.from({length: num}, (_, i) => start + step * i);
}

const formatTimeTick = (v) => {
    return `${v/1e9} s`
}

const formatSizeTick = (v) => {
    return Math.log2(v).toFixed(0);
}

/// increase the density of the array by adding the middle elements
const denser = (xs) => {
    // get the middle elements
    var ys = xs.map((x, i) => {
        if (i === 0) {
            return x;
        } else {
            return (x + xs[i-1]) / 2;
        }
    });
    ys.shift();
    // concat and sort
    return [...xs, ...ys].sort((a, b) => a - b);
}

export const functionToPlotData = (range, f, id="foo") => {
    // enhance resolution for the xs
    const xs = range.filter((x)=> x>16) //  linspace(range[0], range[range.length-1], range.length*100);
    const xys = xs.map((x) => ({ "x": x, "y": f(x)}));
    return {id, "enablePoints": false, "data": [... xys]};
}

const tooltipElement = (props) => {
    const tooltipstyle = {
        border: "2px solid",
        borderRadius: "5px",
        padding: "2px",
        fontSize: 10,
        // fontWeight: "bold",
        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
        marginBottom: "2px",

    };
    const time = humanTime(props.point.data.y)
    return <div style={tooltipstyle}>
        MSM of size <InlineMath math={`2^{${Math.log2(props.point.data.x).toFixed(0)}}`} /> run in {time}
    </div>
};

export const Plot = ({ data, height, ...kwargs }) => {
    return (
    // we must make sure parent container have a defined height when using
    // responsive component, otherwise height will be 0 and
    // no chart will be rendered.
    <div style={{height: height}}>
    <ResponsiveLine
        {...kwargs}
        data={data}
        margin={{ top: 30, right: 110, bottom: 70, left: 60 }}
        xMin={16}
        yMin={16}
        yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: true,
            reverse: false
        }}
        xScale={{
            type: 'point',
            base: 2,
            min: 'auto',
            max: 'auto',
        }}
        // yScale={{
        //     type: 'log',
        //     base: 2,
        //     min: 16,
        //     max: 'auto',
        // }}
        yFormat=' >-.2f'
        axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'MSM size (log2)',
            format: formatSizeTick,
            legendOffset: 36,
            legendPosition: 'middle',
        }}
        axisLeft={{
            orient: 'left',
            format: formatTimeTick,
            tickSize: 5,
            tickRotation: 10,
            // legend: 'time (ns)',
            legendOffset: -40,
            legendPosition: 'middle',
        }}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
        tooltip={tooltipElement}
        // legends={[
        //     {
        //         anchor: 'bottom-right',
        //         direction: 'column',
        //         justify: false,
        //         translateX: 100,
        //         translateY: 0,
        //         itemsSpacing: 0,
        //         itemDirection: 'left-to-right',
        //         itemWidth: 80,
        //         itemHeight: 20,
        //         itemOpacity: 0.75,
        //         symbolSize: 12,
        //         symbolShape: 'circle',
        //         symbolBorderColor: 'rgba(0, 0, 0, .5)',
        //         effects: [
        //             {
        //                 on: 'hover',
        //                 style: {
        //                     itemBackground: 'rgba(0, 0, 0, .03)',
        //                     itemOpacity: 1
        //                 }
        //             }
        //         ]
            // }
        // ]}
    />
    </div>)
}