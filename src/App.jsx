import { Thermometer, Droplet } from 'lucide-react'
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { InfluxDB } from '@influxdata/influxdb-client';
import logo from './assets/logo_dark.svg';

function App() {
    const [data, setData] = useState([]);
    const [latestTemperature, setLatestTemperature] = useState(null);
    const [latestHumidity, setLatestHumidity] = useState(null);
    const [loading, setLoading] = useState(false);

    const token = import.meta.env.VITE_INFLUXDB_TOKEN;
    const url = import.meta.env.VITE_INFLUXDB_URL;
    const org = import.meta.env.VITE_INFLUXDB_ORG;
    const bucket = import.meta.env.VITE_INFLUXDB_BUCKET;

    useEffect(() => {
        setLoading(true);
        const influxDB = new InfluxDB({ url, token });
        const queryApi = influxDB.getQueryApi(org);

        const query = `
      from(bucket: "${bucket}")
        |> range(start: -1d)
        |> filter(fn: (r) => r._measurement == "ruuvi_measurements")
        |> filter(fn: (r) => r.mac == "${import.meta.env.VITE_RUUVI_SERIAL}")
        |> filter(fn: (r) => r._field == "temperature")
        |> aggregateWindow(every: 10m, fn: mean)
        |> yield(name: "mean")
    `;

        const latestValuesQuery = `
          from(bucket: "${bucket}")
            |> range(start: -1h)
            |> filter(fn: (r) => r._measurement == "ruuvi_measurements")
            |> filter(fn: (r) => r.mac == "${import.meta.env.VITE_RUUVI_SERIAL}")
            |> filter(fn: (r) => r._field == "temperature" or r._field == "humidity")
            |> last()
        `;

        queryApi.queryRows(query, {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                setData((prevData) => [
                    ...prevData,
                    { time: o._time, temperature: o._value },
                ]);
            },
            error(error) {
                console.error('Query failed', error);
            },
            complete() {
                console.log('Query completed');
            },
        });

        queryApi.queryRows(latestValuesQuery, {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                if (o._field === "temperature") setLatestTemperature(o._value);
                if (o._field === "humidity") setLatestHumidity(o._value);
            },
            error(error) {
                console.error('Query failed', error);
            },
            complete() {
                console.log('Latest values query completed');
                setLoading(false);
            },
        });
    }, []);

  return (
    <>
      <header className={'w-full bg-primary p-6 flex justify-between items-center'}>
          <h1 className={'text-3xl font-bold'}>Simple Ruuvi Visualizer</h1>
          <img className={'w-32'} src={logo} alt="Logo"/>
      </header>
        {loading ? (
            <p className={'text-white'}>Loading...</p>
        ) : (
            <div className={'max-w-[900px] mx-auto text-white space-y-4 mt-6 p-4'}>
                <div className={'p-4 rounded-lg border-2 border-[#535353]'}>
                    <p className={'mb-4'}>Panicroom</p>
                    <div className={'flex justify-between items-center'}>
                        <h2 className={'text-xl flex items-center gap-2'}><Thermometer
                            className={'stroke-primary'}/> Lämpötila</h2>
                        <p className={'text-xl font-semibold'}>{Math.round(latestTemperature)} °C</p>
                    </div>
                    <div className={'flex justify-between items-center'}>
                        <h2 className={'text-xl flex items-center gap-2'}><Droplet
                            className={'stroke-primary'}/> Suhteellinen kosteus</h2>
                        <p className={'text-xl font-semibold'}>{Math.round(latestHumidity)} %</p>
                    </div>
                </div>

                <div className={'p-4 rounded-lg border-2 border-[#535353] overflow-x-auto'}>
                    <div>
                        <LineChart
                            width={800}
                            height={400}
                            data={data}
                            margin={{top: 5, right: 20, left: 10, bottom: 5}}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="time" tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()}/>
                            <YAxis dataKey="temperature" unit="°C"/>
                            <Tooltip labelFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()}/>
                            <Legend/>
                            <Line type="monotone" dataKey="temperature" stroke="#8884d8"/>
                        </LineChart>
                    </div>
                </div>
            </div>
        )}

    </>
  )
}

export default App
