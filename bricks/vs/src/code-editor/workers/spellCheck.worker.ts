// istanbul ignore file
import { expose } from "comlink";
import {
  spellCheck,
  SpellCheckRequest,
  SpellCheckResponse,
} from "./spellCheck";

class SpellCheckWorker {
  spellCheck(req: SpellCheckRequest): SpellCheckResponse {
    return spellCheck(req);
  }
}

expose(SpellCheckWorker);
