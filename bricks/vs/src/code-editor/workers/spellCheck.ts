import Typo from "typo-js";
import { noCase } from "change-case";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import { aff, dic } from "../../generated-dictionary.js";

const WORD_REGEX = /(?<![a-zA-Z])[a-zA-Z]{4,}(?![a-zA-Z])/g;

const WELL_KNOWN_WORDS: string[] = [
  ...[
    "const",
    "param",
    "diff",
    "username",
    "json",
    "yaml",
    "workflow",
    "concat",
    "config",
    "testid",
    "uuid",
    "http",
    "bool",
    "namespace",
    "builtin",
    "buildin",
    "href",
    "hostname",
    "admin",
    "javascript",
    "attr",
    "todo",
    "enum",
    "struct",
    "textarea",
    "regexp",
    "tooltip",
    "timestamp",
    "submenu",
    "middleware",
    "kube",
    "changelog",
    "upsert",
  ].flatMap((word) => [word, `${word}s`]),
  ...["checkbox", "regex"].flatMap((word) => [word, `${word}es`]),
  "antd",
  "easyops",
  "stringify",
  "typeof",
  "keyof",
  "instanceof",
  "calc",
  "vertices",
  "indices",
  "conf",
  "completers",
  "datetime",
  "prev",
  "apps",
  "args",
  "deps",
  "expr",
  "desc",
  "init",
  "mtime",
  "ctime",
  "readonly",
  "yyyy",
  "grayblue",
  "uniq",
  "unshift",
  "dest",
  "rgba",
  "hsla",
  "apis",
  "succ",

  "cmdb",
  "itsc",
  "itsm",
  "olap",
  "onemodel",

  "mysql",
  "mssql",
  "redis",
  "clickhouse",
  "mongodb",
  "zookeeper",
  "etcd",
  "amqp",
  "mariadb",
  "postgre",
  "elasticsearch",
  "rocketmq",
  "memcache",
  "memcached",
  "grpc",
  "kubernetes",
  "otel",
  "deepflow",
];

export interface SpellCheckRequest {
  source: string;
  knownWords?: string[];
}

export interface SpellCheckResponse {
  markers: Marker[];
}

export interface Marker {
  start: number;
  end: number;
  message: string;
  severity: keyof typeof monaco.MarkerSeverity;
}

let typo: Typo;

function getDictionary(): Typo {
  if (!typo) {
    typo = new Typo("en_US", aff, dic);
  }
  return typo;
}

export function spellCheck({
  source,
  knownWords,
}: SpellCheckRequest): SpellCheckResponse {
  const dictionary = getDictionary();
  let match: RegExpExecArray | null = null;
  const markers: Marker[] = [];
  WORD_REGEX.lastIndex = 0;

  // Handle css hex colors
  const fixedSource = source.replace(
    /#[a-fA-Z0-9]{6}(?:[a-fA-Z0-9]{2})?\b/g,
    (match) => Array.from({ length: match.length }, () => "*").join("")
  );

  while ((match = WORD_REGEX.exec(fixedSource))) {
    const lowerWords = noCase(match[0]).split(" ");
    let offset = 0;
    for (const lowerWord of lowerWords) {
      const start = match.index + offset;
      const end = start + lowerWord.length;
      offset += lowerWord.length;
      const originalWord = source.slice(start, end);
      if (
        originalWord.length > 3 &&
        !dictionary.check(originalWord) &&
        !WELL_KNOWN_WORDS.includes(lowerWord) &&
        !knownWords?.includes(lowerWord)
      ) {
        // If the original word is all lowercase and the dictionary has a capitalized version, skip it
        if (
          originalWord === lowerWord &&
          dictionary.checkExact(
            `${lowerWord.slice(0, 1).toUpperCase()}${lowerWord.slice(1)}`
          )
        ) {
          continue;
        }

        // Handle special case of "doesn't"
        if (
          lowerWord === "doesn" &&
          source.slice(start, end + 2).toLowerCase() === "doesn't"
        ) {
          continue;
        }

        // Handle special case of "$nlike"
        if (
          originalWord === "nlike" &&
          start > 0 &&
          source[start - 1] === "$"
        ) {
          continue;
        }

        const message = `"${originalWord}": Unknown word.`;
        markers.push({
          start,
          end,
          message,
          severity: "Info",
        });
      }
    }
  }
  return { markers };
}
