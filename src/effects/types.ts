export interface IEffectBase {
  id: string;
  type?: "in" | "out";
  objectProperties?: {
    width: number;
    height: number;
    objectHtml: string;
  };
  // >> flags beginning (TODO: make flags optional as by default they are false)
  hasDelay: boolean;
  hasDuration: boolean;
  hasEase: boolean;
  hasChildEase: boolean;
  hasTimeDistribution?: boolean;
  // << flags end
  timeDistribution?: number;
  ease?: string;
  customEase?: string;
  childEase?: string;
  childCustomEase?: string;
  duration?: number;
  delay?: number;
}

export interface IEasing {
  label: string;
  value: string;
}

export const EasingOptions: IEasing[] = [
  // none
  "none",
  // power
  "power1.in",
  "power1.inOut",
  "power1.out",
  "power2.in",
  "power2.inOut",
  "power2.out",
  "power3.in",
  "power3.inOut",
  "power3.out",
  "power4.in",
  "power4.inOut",
  "power4.out",
  // back
  "back.in(1)",
  "back.in(2)",
  "back.in(3)",
  "back.inOut(1)",
  "back.inOut(2)",
  "back.inOut(3)",
  "back.out(1)",
  "back.out(2)",
  "back.out(3)",
  //elastic
  "elastic.in(1, 0.3)",
  "elastic.in(1, 0.5)",
  "elastic.in(1, 0.7)",
  "elastic.inOut(1, 0.3)",
  "elastic.inOut(1, 0.5)",
  "elastic.inOut(1, 0.7)",
  "elastic.out(1, 0.3)",
  "elastic.out(1, 0.5)",
  "elastic.out(1, 0.7)",
].map((item) => ({ label: item, value: item }));
