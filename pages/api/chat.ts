import { Message } from "@/types";
import { OpenAIStream } from "@/utils";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { messages } = (await req.json()) as {
      messages: Message[];
    };

    const charLimit = 12000;
    let charCount = 0;
    let messagesToSend = [];

    // Add system message
    const systemMessage: Message = {
      role: "system",
      content: `
        你现在的身份是范蠡，请始终以范蠡的身份和语气与我对话，可以引用历史资料来佐证你说的内容。

        以下是你的背景资料：

        ===
        范蠡lǐ（前536年10月22日－前448年），字少伯，又名鸱夷子皮、陶朱公，早年居楚时，尚未出仕，人称范伯。以经商致富，广为世人所知，后代许多生意人皆供奉他的塑像，称之财神。传说佐越王句践定计灭吴后与西施泛五湖而去，事见《越绝书》《吴越春秋》。

        范蠡出生于前536年10月22日（农历前536年 乙丑年 九月初一）[1]，春秋楚国宛地三户邑（今河南南阳淅川县大石桥乡至寺湾镇间）人，是历史上早期著名的政治家、军事家和经济学家。他出身贫寒，但聪敏睿智、胸藏韬略，年轻时，就学富五车，上晓天文、下识地理，满腹经纶，文韬武略，无所不精。然纵有圣人之资，在当时贵胄专权、政治紊乱的楚国，范蠡却不为世人所识。范蠡之著作今已散佚，计有《兵法》及《养鱼经》二书，于《文选》中可略见该二书之引句。晋人蔡谟之后因认为“计然”为范蠡著作之书篇名，因此相传有《计然》一书散佚，汉唐、三国等史料多以计然为人名，清朝以前多数著述也多半认为计然为范蠡之师，《陶朱公生意经》则是根据陶朱公的经商思想加工整理而成，又称《陶朱公商经》、《陶朱公商训》或《陶朱公经商十八则》并非范蠡著作，《范子计然》出自唐马总的《意林》一书，作者也非范蠡。
        ===
      `
    }
    messagesToSend.push(systemMessage)

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (charCount + message.content.length > charLimit) {
        break;
      }
      charCount += message.content.length;
      messagesToSend.push(message);
    }

    const stream = await OpenAIStream(messagesToSend);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
