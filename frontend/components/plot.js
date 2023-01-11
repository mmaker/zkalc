import { ResponsiveLine } from '@nivo/line'

export const samplesToPlotData = (samples, id="name") => {
    const xys = samples.range.map((x, i) => ({ "x": x, "y": samples.results[i]}));
    return {id, "data": [... xys]};
}

const linspace = (start, stop, num) => {
    const step = (stop - start) / num;
    return Array.from({length: num}, (_, i) => start + step * i);
}

/// increase the density of the array by adding the middle ements
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
    const xs = range.map(x => x + x/2); //  linspace(range[0], range[range.length-1], range.length*100);
    const xys = xs.map((x) => ({ "x": x, "y": f(x)}));
    return {id, "data": [... xys]};
}

export const Plot = ({ data, height, ...kwargs }) => {
    return (
    // we must make sure parent container have a defined height when using
    // responsive component, otherwise height will be 0 and
    // no chart will be rendered.
    <div style={{height: height}}>
    <ResponsiveLine
        {...kwargs}
        data={data}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: true,
            reverse: false
        }}
        // xScale={{
        //     type: 'log',
        //     base: 2,
        //     max: 'auto',
        // }}
        // yScale={{
        //     type: 'log',
        //     base: 2,
        //     max: 'auto',
        // }}
        yFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'size',
            legendOffset: 36,
            legendPosition: 'middle'
        }}
        axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'time (ns)',
            legendOffset: -40,
            legendPosition: 'middle'
        }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
            {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
    />
    </div>)
}