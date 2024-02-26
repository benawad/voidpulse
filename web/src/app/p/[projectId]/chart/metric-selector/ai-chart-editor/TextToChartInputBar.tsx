import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useChartStateContext } from "../../../../../../../providers/ChartStateProvider";
import { useProjectBoardContext } from "../../../../../../../providers/ProjectBoardProvider";
import { Input } from "../../../../../ui/Input";
import { genId } from "../../../../../utils/genId";
import { trpc } from "../../../../../utils/trpc";

interface AiInputBarProps {}

type Inputs = {
  userInputText: string;
};

export const TextToChartInputBar: React.FC<AiInputBarProps> = ({}) => {
  const { projectId } = useProjectBoardContext();
  const [, setState] = useChartStateContext();
  const { mutateAsync } = trpc.textToChart.useMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    reset();
    return mutateAsync({
      text: data.userInputText,
      projectId,
    }).then((data) => {
      if (data.info) {
        setState((prev) => ({
          ...prev,
          reportType: data.info!.reportType,
          chartType: data.info!.chartType,
          metrics: data.info!.events.map((e) => ({
            id: genId(),
            event: e,
            filters: [],
          })),
        }));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-2">
      <Input
        autoFocus
        placeholder="Or tell me what you want to see ✨"
        className="border border-primary-500/50"
        {...register("userInputText", { required: true })}
      />
    </form>
  );
};
