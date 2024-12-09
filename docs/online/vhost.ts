import { WebContainer } from "@webcontainer/api";

export async function startDevServer(
  vhost: WebContainer,
  output: HTMLIFrameElement,
  onReady: (srv: { url: string; port: number }) => void
) {
  // Run `npm run start` to start the Express app
  await vhost.spawn("npm", ["run", "start"]);

  vhost.on("server-ready", (port, url) => {
    output.src = url;
    onReady({ url, port });
  });
  vhost.on("error", (err) => {
    console.log("STATRT ERR", err);
  });
}

export async function installDependencies(vhost: WebContainer) {
  // Install dependencies
  const installProcess = await vhost.spawn("npm", ["install"]);
  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log(data);
      },
    })
  );
  // Wait for install command to exit
  return installProcess.exit;
}

export async function writeInputJS(vhost: WebContainer, content: string) {
  await vhost.fs.writeFile("/input.ts", content);
}
