1. 빌드시 필수사항.  
    아래 사항 지키지 않으면 일부 nvidia 그래픽카드에서 크래쉬 발생함  
      
    1,delete %localappdata%<ProjectName>\Saved<ProjectName>_PCD3D_SM6.upipelinecache and 그리고 에디터 키면 Command

r.ShaderPipelineCache.SaveUserCache 0
run_app_build ..\scripts\app_3010460.vdf
V206Main048 shipping 11/05 20:50 hyeongjin kwun
shipping 일 때는 pdb 백트레이스 업로드할 것.