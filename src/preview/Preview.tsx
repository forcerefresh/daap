import React, { Component, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { IStore } from "../store/store";
import css from "./Preview.module.scss";
import gsap from "gsap";
import Slika from "./slika.jpg";

export const Preview = () => {
  const divRef = useRef(null);

  useEffect(() => {
    //var tl = gsap.timeline({ repeat: 100 });
    //tl.to(divRef.current, { rotation: 20, duration: 1.5, x: 750 }); //.from(divRef.current, { duration: 1, y: 1300 })

    return () => {
      // console.log("cleanup");
    };
  }, [divRef]);

  return (
    <div className={css.preview}>
      <div ref={divRef}>
        Test
        <img height="250" src={Slika} alt="Logo" />
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Preview);
