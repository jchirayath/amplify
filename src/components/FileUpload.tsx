import React from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Input } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import FileOpenIcon from "@mui/icons-material/FileOpen";

export type FileUploadProps = {
  imageButton?: boolean;
  accept: string;
  hoverLabel?: string;
  dropLabel?: string;
  width?: string;
  height?: string;
  backgroundColor?: string;
  image?: {
    url: string;
    imageStyle?: {
      width?: string;
      height?: string;
    };
  };
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLElement>) => void;
};

// const useStyles: any = makeStyles(() =>
//   createStyles({
//     root: {
//       cursor: "pointer",
//       textAlign: "center",
//       display: "flex",
//       "&:hover p,&:hover svg,& img": {
//         opacity: 1,
//       },
//       "& p, svg": {
//         opacity: 0.4,
//       },
//       "&:hover img": {
//         opacity: 0.3,
//       },
//     },
//     iconText: {
//
//     },
//     onDragOver: {
//       "& img": {
//         opacity: 0.3,
//       },
//       "& p, svg": {
//         opacity: 1,
//       },
//     },
//   })
// );

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  imageButton = false,
  hoverLabel = "Click or drag to upload file",
  dropLabel = "Drop file here",
  width = "600px",
  height = "100px",
  backgroundColor = "#fff",
  image: {
    url = "",
    imageStyle = {
      height: "inherit",
    },
  } = {},
  onChange,
  onDrop,
}) => {
  // const classes: any = useStyles();
  const [fileName, setFileName] = React.useState<string>("");
  const [labelText, setLabelText] = React.useState<string>(hoverLabel);
  const [isDragOver, setIsDragOver] = React.useState<boolean>(false);
  const [isMouseOver, setIsMouseOver] = React.useState<boolean>(false);
  const stopDefaults = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };
  const dragEvents = {
    onMouseEnter: () => {
      setIsMouseOver(true);
    },
    onMouseLeave: () => {
      setIsMouseOver(false);
    },
    onDragEnter: (e: React.DragEvent) => {
      stopDefaults(e);
      setIsDragOver(true);
      setLabelText(dropLabel);
    },
    onDragLeave: (e: React.DragEvent) => {
      stopDefaults(e);
      setIsDragOver(false);
      setLabelText(hoverLabel);
    },
    onDragOver: stopDefaults,
    onDrop: (e: React.DragEvent<HTMLElement>) => {
      stopDefaults(e);
      setLabelText(hoverLabel);
      setIsDragOver(false);
      if (e.dataTransfer.files[0]) {
        setFileName(e.dataTransfer.files[0].name);
      }
      onDrop(e);
    },
  };

  const handleChange = (event: any) => {
    if (event.target.files[0]) {
      setFileName(event.target.files[0].name);
    }

    onChange(event);
  };

  return (
    <Grid
      sx={{
        width: width,
        height: height,
      }}
      item
      xs={6}
    >
      <Input
        onChange={handleChange}
        sx={{
          display: "none",
          width: "100%",
          height: "100%",
        }}
        hidden
        id="file-upload"
        type="file"
      />
      <label
        htmlFor="file-upload"
        {...dragEvents}
        style={{
          cursor: "pointer",
          position: "relative",
          top: 0,
          left: 0,
          width: isDragOver ? "100%" : width,
        }}
      >
        <Box
          sx={{
            boxShadow: 1,
            backgroundColor: (theme) => theme.palette.grey[200],
            position: "relative",
            top: 0,
            left: 0,
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          {fileName !== "" ? (
            <>
              <FileOpenIcon fontSize="large" />{" "}
              <Typography variant="body2">{`${fileName}`}</Typography>
            </>
          ) : (
            <>
              <CloudUploadIcon fontSize="large" />
              <Typography>{labelText}</Typography>
            </>
          )}
        </Box>
      </label>
    </Grid>
  );
};

export default FileUpload;
