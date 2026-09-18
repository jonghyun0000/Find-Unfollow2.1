import { parseExport, safeParseJSON, validateFileSelection } from '@/lib/parser';
import { analyze } from '@/lib/analyzer';
self.onmessage = async (
  event: MessageEvent<{ files: File[]; account: string; snapshotDate: string }>,
) => {
  try {
    const { files, account, snapshotDate } = event.data;
    validateFileSelection(files);
    const inputs = [];
    for (const file of files)
      inputs.push({ name: file.name, raw: safeParseJSON(await file.text()) });
    const { following, followers } = parseExport(inputs);
    self.postMessage({ result: analyze(following, followers, { account, snapshotDate }) });
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : '분석하지 못했습니다. 파일을 확인해주세요.',
    });
  }
};
