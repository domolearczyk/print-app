!macro customInstall
  CreateDirectory $LOCALAPPDATA\SumatraPDF
  CopyFiles $INSTDIR\sumatra $LOCALAPPDATA\SumatraPDF
  Delete $INSTDIR\sumatra
!macroend