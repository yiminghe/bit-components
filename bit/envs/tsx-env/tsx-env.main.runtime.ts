import { MainRuntime } from '@teambit/cli';
import { ReactAspect, ReactMain, } from '@teambit/react';
import { EnvsAspect, EnvsMain } from '@teambit/envs';
import { TsxEnvAspect } from './tsx-env.aspect';
import MultiCompilerAspect, { MultiCompilerMain } from '@teambit/multi-compiler';
import { CompilerAspect, CompilerMain } from '@teambit/compiler';
import { BabelAspect, BabelMain } from '@teambit/babel';
import { babelConfig } from './babel/babel.config';

export class TsxEnvMain {
  static slots = [];

  static dependencies = [ReactAspect, BabelAspect, EnvsAspect, CompilerAspect, MultiCompilerAspect];

  static runtime = MainRuntime;

  static async provider([react, babel, envs, compiler, multiCompiler]: [ReactMain, BabelMain, EnvsMain, CompilerMain, MultiCompilerMain]) {
    const { reactEnv } = react;

    const cjsCompiler = reactEnv.getTsCjsCompiler();

    const babelCompiler = babel.createCompiler({
      babelTransformOptions: babelConfig,
      distDir: 'esm',
      artifactName: 'esm',
    });

    const esCjsCompiler = multiCompiler.createCompiler([
      cjsCompiler,
      babelCompiler,
    ], {});


    // Get React's build pipeline
    const basicBuildPipeline = react.reactEnv.getBuildPipe();
    // Filter out compilation build tasks
    const basicBuildPipelineWithoutCompilation = basicBuildPipeline.filter(
      (task) => task.aspectId !== CompilerAspect.id
    );

    const compilerBuildTask = [
      compiler.createTask('MulCompiler', esCjsCompiler),
      ...basicBuildPipelineWithoutCompilation,
    ];

    const TsxEnvEnv = react.compose([
      react.overridePackageJsonProps({
        module: 'esm/index.js',
        typings: 'dist/index.d.ts',
      }),
      envs.override({
        getCompiler: () => esCjsCompiler,
        getBuildPipe: () => compilerBuildTask,
      })
    ]);

    envs.registerEnv(TsxEnvEnv);
    return new TsxEnvMain();
  }
}

TsxEnvAspect.addRuntime(TsxEnvMain);
