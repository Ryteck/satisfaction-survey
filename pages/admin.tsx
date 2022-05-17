import { ShortAnswer } from '@prisma/client';
import axios from 'axios';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryPie, VictoryTheme } from 'victory';

const AdminPage: NextPage = () => {
  const [controllerMode, setControllerMode] = useState<'ALL' | 'SPECIFIC' | 'BETWEEN'>('ALL');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [shortAnswers, setShortAnswers] = useState<ShortAnswer[]>([]);

  const getCountShortAnswers = () => {
    const obj = {};

    shortAnswers.forEach(({ value }) => {
      if (obj[value]) {
        obj[value] += 1;
      } else {
        obj[value] = 1;
      }
    });

    return [
      {
        value: 'ONE',
        count: obj['ONE'] || 0,
      },
      {
        value: 'TWO',
        count: obj['TWO'] || 0,
      },
      {
        value: 'THREE',
        count: obj['THREE'] || 0,
      },
      {
        value: 'FOUR',
        count: obj['FOUR'] || 0,
      },
      {
        value: 'FIVE',
        count: obj['FIVE'] || 0,
      },
    ];
  };

  const getValueColors = (value: string) => {
    if (value === 'ONE') return 'red';
    if (value === 'TWO') return 'orange';
    if (value === 'THREE') return 'yellow';
    if (value === 'FOUR') return 'lime';
    if (value === 'FIVE') return 'green';

    return 'black';
  };

  const loadData = () => {
    toast
      .promise((async () => {
        switch (controllerMode) {
          case 'ALL':
            const { data: responseAll } = await axios.get('/api/shortAnswers');
            setShortAnswers(responseAll);
            break;
          case 'SPECIFIC':
            const day = startDate.getDate();
            const month = startDate.getMonth() + 1;
            const year = startDate.getFullYear();

            const newStartDate = new Date(`${year}-${month}-${day} 00:00:00`);
            const newEndDate = new Date(`${year}-${month}-${day} 23:59:59`);

            const { data: responseSpecific } = await axios.get('/api/shortAnswers', {
              params: {
                startDate: newStartDate,
                endDate: newEndDate,
              },
            });

            setShortAnswers(responseSpecific);
            break;
          case 'BETWEEN':
            if (startDate.getTime() > endDate.getTime()) throw new Error('Data inicial maior que data final');

            const { data: responseBetween } = await axios.get('/api/shortAnswers', {
              params: {
                startDate,
                endDate,
              },
            });

            setShortAnswers(responseBetween);
            break;
          default:
            throw new Error('Unknown mode');
        }
      })(), {
        loading: 'Carregando...',
        success: 'Busca realizada com sucesso',
        error: (err) => `Erro ao buscar: ${err.message}`,
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onSearch = () => {
    if (isLoading) {
      toast.error('Por favor, aguarde o fim da busca');
      return;
    }

    setIsLoading(true);
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log(shortAnswers);
  }, [shortAnswers]);

  return (
    <>
      <h1 className="pt-8 text-5xl text-white">Admin</h1>

      <div className="flex justify-around items-center w-full h-full text-white">
        <div>
          {
            shortAnswers.length > 0 && (
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={10}
                animate={{
                  duration: 2000,
                  onLoad: { duration: 1000 },
                }}
              >
                <VictoryBar
                  data={getCountShortAnswers()}
                  x="value"
                  y="count"
                  labels={({ datum }) => datum.count}
                  style={{
                    data: {
                      fill: ({ datum }) => getValueColors(datum.value),
                      stroke: '#fff',
                      strokeWidth: 1,
                    },
                    labels: {
                      fill: '#fff',
                      fontSize: 20,
                    },
                  }}
                />

                <VictoryAxis
                  style={{
                    grid: { stroke: 'none' },
                  }}
                />
              </VictoryChart>
            )
          }
        </div>

        <div>
          {
            shortAnswers.length > 0 && (
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={10}
                animate={{
                  duration: 2000,
                  onLoad: { duration: 1000 },
                }}
              >
                <VictoryPie
                  data={getCountShortAnswers()}
                  x="value"
                  y="count"
                  labels={({ datum }) => datum.count}
                  style={{
                    data: {
                      fill: ({ datum }) => getValueColors(datum.value),
                      stroke: '#fff',
                      strokeWidth: 1,
                    },
                    labels: {
                      fill: '#fff',
                      fontSize: 20,
                    },
                  }}
                />

                <VictoryAxis
                  style={{
                    grid: { stroke: 'none' },
                    axis: { stroke: 'none' },
                    ticks: { display: 'none' },
                    tickLabels: { display: 'none' },
                  }}
                />
              </VictoryChart>
            )
          }
        </div>
      </div>

      <footer className="flex justify-between items-center w-full h-80">
        <div className="pl-2 flex flex-col justify-around items-center h-full">
          <input
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-40 cursor-pointer"
            type="button"
            value="Tudo"
            onClick={() => setControllerMode('ALL')}
          />

          <input
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-40 cursor-pointer"
            type="button"
            value="Dia específico"
            onClick={() => setControllerMode('SPECIFIC')}
          />

          <input
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-40 cursor-pointer"
            type="button"
            value="Período"
            onClick={() => setControllerMode('BETWEEN')}
          />
        </div>

        <div>
          {
            controllerMode === 'ALL' && (
              <div className="flex flex-col items-start gap-4">
                <h2 className="text-white text-2xl">Todos os dias...</h2>
                <h2 className="text-white text-2xl">controles não disponíveis</h2>
              </div>
            )
          }
          {
            controllerMode === 'SPECIFIC' && (
              <div className="flex flex-col items-start gap-4">
                <h2 className="text-white text-2xl">Selecione o dia:</h2>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  locale="pt-BR"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            )
          }
          {
            controllerMode === 'BETWEEN' && (
              <div className="flex justify-around gap-8">
                <div className="flex flex-col items-start gap-4">
                  <h2 className="text-white text-2xl">Inicio: </h2>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    locale="pt-BR"
                    timeInputLabel="Momento:"
                    showTimeInput
                    dateFormat="dd/MM/yyyy - HH:mm"
                  />
                </div>

                <div className="flex flex-col items-start gap-4">
                  <h2 className="text-white text-2xl">Fim: </h2>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    locale="pt-BR"
                    timeInputLabel="Momento:"
                    showTimeInput
                    dateFormat="dd/MM/yyyy - HH:mm"
                  />
                </div>
              </div>
            )
          }
        </div>

        <div className="pr-2">
          <input
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-40 cursor-pointer"
            type="button"
            value="Pesquisar"
            onClick={onSearch}
          />
        </div>
      </footer>
    </>
  );
};

export default AdminPage;
