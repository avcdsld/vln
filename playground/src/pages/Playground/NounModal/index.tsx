import { Button } from "react-bootstrap";
import classes from "./NounModal.module.css";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Noun from "../../../components/Noun";
import { svg2png } from "../../../utils/svg2png";
import { Backdrop } from "../../../components/Modal";
import { connect, mint } from "../../../utils/web3ModalUtil";

const downloadNounPNG = (png: string) => {
  const downloadEl = document.createElement("a");
  downloadEl.href = png;
  downloadEl.download = "noun.png";
  downloadEl.click();
};

const NounModal: React.FC<{
  onDismiss: () => void;
  svg: string;
  seed: { [key: string]: number };
  tokenId: number;
}> = (props) => {
  const { onDismiss, svg, seed, tokenId } = props;

  const [width, setWidth] = useState<number>(window.innerWidth);
  const [png, setPng] = useState<string | null>();

  const isMobile: boolean = width <= 991;

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);

    const loadPng = async () => {
      setPng(await svg2png(svg, 500, 500));
    };
    loadPng();

    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, [svg]);

  const mintNoun = async (seed: { [key: string]: number }, tokenId: number) => {
    try {
      const web3Provider = await connect();
      // TODO: check seed existing
      await mint(web3Provider, seed, tokenId);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop
          onDismiss={() => {
            onDismiss();
          }}
        />,
        document.getElementById("backdrop-root")!
      )}
      {ReactDOM.createPortal(
        <div className={classes.modal}>
          {png && (
            <Noun
              imgPath={png}
              alt="noun"
              className={classes.nounImg}
              wrapperClassName={classes.nounWrapper}
            />
          )}
          <div className={classes.displayNounFooter}>
            <span>Use this Noun as your profile picture!</span>
            {!isMobile && png && (
              <Button
                onClick={() => {
                  downloadNounPNG(png);
                }}
              >
                Download
              </Button>
            )}
            {png && (
              <Button
                onClick={() => {
                  mintNoun(seed, tokenId);
                }}
              >
                Mint
              </Button>
            )}
          </div>
        </div>,
        document.getElementById("overlay-root")!
      )}
    </>
  );
};
export default NounModal;
