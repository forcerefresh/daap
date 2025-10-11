import { AiPrompt } from "../../types/ai-prompts";
import PromptCard, { PromptCardProps } from "./prompt-card";

export const PromptItems = ({
  aiPrompts,
  onGenerateAll,
  onGenerateColors,
  onGenerateImages,
  onGenerateVectors,
  updatePrompt,
}: {
  aiPrompts: AiPrompt[];
  onGenerateAll: (id: string) => void;
  onGenerateColors?: (id: string) => void;
  onGenerateImages?: (id: string) => void;
  onGenerateVectors?: (id: string) => void;
  updatePrompt: PromptCardProps["updatePrompt"];
}) => {
  return (
    <div
      style={{
        padding: 0,
        width: "100%",
        gap: 16,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* <h2>Prompts</h2> */}
      {aiPrompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onGenerateAll={onGenerateAll}
          onGenerateColors={onGenerateColors}
          onGenerateImages={onGenerateImages}
          onGenerateVectors={onGenerateVectors}
          updatePrompt={updatePrompt}
        />
      ))}
    </div>
  );
};
